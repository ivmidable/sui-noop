const program_id =
  "0x62bd5641279a3cbe992ded2518db1450bb854ed2d95995772b2fb992d8860782";

import {
  getFullnodeUrl,
  ProgrammableTransaction,
  SuiClient,
} from "@mysten/sui.js/client";

import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { bcs, PureArg } from "@mysten/sui.js/bcs";
import wallet from "../wallet.json";
import * as fs from "fs";
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import { execSync } from "child_process";
import zlib from "zlib";
import { promisify } from "util";

const keypair = Ed25519Keypair.fromSecretKey(
  decodeSuiPrivateKey(wallet).secretKey
);

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

const sleep = require("util").promisify(setTimeout);

const network = "testnet";
(async () => {
  try {
    let image = fs.readFileSync("../files/large_test.png");
   

    // console.log(image.length);
    // console.log(gz_image.length);
    // console.log(bt_image.length);

    let digest = await uploadImage("test.png", "image/png", "binary", image);
    //console.log(digest);
    //await DownloadNoopCat("9Su4GtLNCjKTa2VgV28LqrMSJt1uvdV9yuXFhXfooAmh")
    //await sleep(1000);
    let res = await downloadAndSave("../files/", "J93jJvWidHa3XH51fUoSLvqX6T7wfMHKiaDbPm9wZJEk");
    openFile(res);
} catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();

interface push {
  type: "pure";
  value: Uint8Array;
  valueType: "vector<u8>";
}

interface push_header {
    name: string;
    mime: string;
    encoding: string;
    type:string;
}

interface push_file {
    header:push_header;
    data: Uint8Array;
}

function openFile(path:string) {
    execSync(
        `open ${path}`
    );
}

async function downloadAndSave(path:string, digest:string) {
    let headerData = await _getHeaderData(digest);
    let data = await _downloadPush(headerData);
    return saveFile(path, data);
}

async function _getPushInputs(digest:string) {
    let res = await client.getTransactionBlock({
        digest,
        options: { showInput: true },
      });
      const transactionKindName = res.transaction?.data.transaction.kind;
      const isProgrammableTransaction = transactionKindName === "ProgrammableTransaction";
      const programmableTxn = res.transaction!.data.transaction as ProgrammableTransaction;
      return programmableTxn.inputs;
}

async function _getHeaderData(digest:string) : Promise<string[]> {
    let headerData = [];
    
    console.log("Loading :", digest);
    let inputs = await _getPushInputs(digest);
    for(let i = 0; i < inputs.length; i++) {
        const input = inputs[i] as push;
        headerData.push(Buffer.from(input.value).toString("utf8"));
    }
    return headerData;
}

async function _downloadPush(headerData:string[]) : Promise<push_file> {
    if (headerData.length > 2) {
        throw new Error("Currently only inputs from 2 tranactions is allowed. format: [{mime}, [digests]].");
    }
    let header:push_header = JSON.parse(headerData[0]);
    let digests = JSON.parse(headerData[1]);
    let input_bytes = Buffer.alloc(0);

    for(let i = 0; i < digests.length; i++) {
        console.log(`Fetching: ${digests[i]}...`);
        let inputs = await _getPushInputs(digests[i]);
        for(let j = 0; j < inputs.length; j++) {
            let input = inputs[j] as push;
            let input_buffer = Buffer.from(input.value);
            input_bytes = Buffer.concat([input_bytes, input_buffer]);
        }
    }
    console.log("Fetching Complete.");

    let file:push_file = {header, data:input_bytes};
    return file;
}

async function uploadImage(name:string, mime:string, encoding:string, img:Buffer) {
  let chunks = splitFile(img, 1000);
  console.log(chunks.length);
  let chunkOfChunks = splitChunks(chunks, 100);
  console.log(chunkOfChunks.length);
  return await _uploadChunkOfChunks(name, mime, encoding, chunkOfChunks);
}

async function _uploadChunks(chunks: any) {
  const txb = new TransactionBlock();
  console.log(`Adding ${chunks.length} Chunks to PTB.`);
  for (let i = 0; i < chunks.length; i++) {
    txb.moveCall({
      target: `${program_id}::push::push_data`,
      arguments: [
        txb.pure(bcs.vector(bcs.u8()).serialize(chunks[i]).toBytes()),
      ],
    });
  }
  console.log("Done.\nUploading Chunks..");
  let txid = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: txb,
  });
  console.log(`Success! Check our your TX here:
        https://suiexplorer.com/txblock/${txid.digest}?network=${network}`);
  return txid.digest;
}

async function _uploadChunkOfChunks(name:string, mime:string, encoding:string, chunkOfChunks: any) {
  let digests = [];
  console.log(`Uploading: ${name} to ${network}..`);
  for (let i = 0; i < chunkOfChunks.length; i++) {
    let digest = await _uploadChunks(chunkOfChunks[i]);
    digests.push(digest);
    await sleep(100);
  }
  await sleep(100);
  return await _uploadHeader(name, mime, encoding, digests);
}

async function _uploadHeader(name:string, mime:string, encoding:string, digests: any) {
  const txb = new TransactionBlock();

  let metadata = Buffer.from(
    JSON.stringify({ name, mime, encoding, type: "push/multi" })
  );
  txb.moveCall({
    target: `${program_id}::push::push_data`,
    arguments: [txb.pure(bcs.vector(bcs.u8()).serialize(metadata).toBytes())],
  });
  let digest_string = Buffer.from(JSON.stringify(digests));
  txb.moveCall({
    target: `${program_id}::push::push_data`,
    arguments: [txb.pure(bcs.vector(bcs.u8()).serialize(digest_string).toBytes())],
  });
  let txid = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: txb,
  });
  console.log(`Success! Check our your TX here:
        https://suiexplorer.com/txblock/${txid.digest}?network=${network}`);
    return txid.digest;
}

function saveFile(path:string, file:push_file) {
    let localFile = path+file.header.name;
    fs.writeFileSync(localFile, file.data);
    return localFile;

}

//split file into chunks
//size is the number of bytes held in each chunk array
function splitFile(bytes: Uint8Array, size: number) {
  const chunks = [];
  for (let i = 0; i < bytes.length; i += size) {
    chunks.push(bytes.slice(i, i + size));
  }
  console.log(`Bytes: ${bytes.length}; Chunk Size: ${size}; Chunks: ${chunks.length}`);
  return chunks;
}

//split chunks into chunk array
//size is the number of elements in each chunk array.
function splitChunks(chunks: Uint8Array[], size: number) {
  console.log("Creating Chunks of Chunks...");
  const chunkOfChunks = [];
  for (let i = 0; i < chunks.length; i += size) {
    chunkOfChunks.push(chunks.slice(i, i + size));
  }
  console.log(`Chunk of Chunks: ${chunkOfChunks.length}, size:${size}`);
  return chunkOfChunks;
}
