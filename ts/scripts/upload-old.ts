const noop =
  "0x20cce53bc888c486bc59595b9455b63973389e4d99c43be188294d85541f87f7";

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
    //let image = fs.readFileSync("../files/large_test.png");
    // let gz_image = zlib.gzipSync(image);
    // let bt_image = zlib.brotliCompressSync(image);

    // console.log(image.length);
    // console.log(gz_image.length);
    // console.log(bt_image.length);

    //let digest = await uploadImage("test.png", "image/png", image);
    //console.log(digest);
    //await DownloadNoopCat("9Su4GtLNCjKTa2VgV28LqrMSJt1uvdV9yuXFhXfooAmh")
    //await sleep(1000);
    let res = await downloadAndSave("../files/", "J93jJvWidHa3XH51fUoSLvqX6T7wfMHKiaDbPm9wZJEk");
    openFile(res);
} catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();

interface noop {
  type: "pure";
  value: Uint8Array;
  valueType: "vector<u8>";
}

interface noop_cat {
    name: string;
    mime: string;
    type: string;
}

interface noop_file {
    cat:noop_cat;
    data: Uint8Array;
}

function openFile(path:string) {
    execSync(
        `open ${path}`
    );
}

async function downloadAndSave(path:string, digest:string) {
    let catData = await _getCatData(digest);
    let data = await _downloadNoopCat(catData);
    return saveFile(path, data);
}

async function _getNoopInputs(digest:string) {
    let res = await client.getTransactionBlock({
        digest,
        options: { showInput: true },
      });
      const transactionKindName = res.transaction?.data.transaction.kind;
      const isProgrammableTransaction = transactionKindName === "ProgrammableTransaction";
      const programmableTxn = res.transaction!.data.transaction as ProgrammableTransaction;
      return programmableTxn.inputs;
}

async function _getCatData(digest:string) : Promise<string[]> {
    let catData = [];
    
    console.log("Loading :", digest);
    let inputs = await _getNoopInputs(digest);
    for(let i = 0; i < inputs.length; i++) {
        const input = inputs[i] as noop;
        catData.push(Buffer.from(input.value).toString("utf8"));
    }
    return catData;
}

async function _downloadNoopCat(catData:string[]) : Promise<noop_file> {
    if (catData.length > 2) {
        throw new Error("Currently only inputs from 2 tranactions is allowed. format: [{mime}, [digests]].");
    }
    let noop_cat:noop_cat = JSON.parse(catData[0]);
    let digests = JSON.parse(catData[1]);
    let input_bytes = Buffer.alloc(0);

    for(let i = 0; i < digests.length; i++) {
        console.log(`Fetching: ${digests[i]}...`);
        let inputs = await _getNoopInputs(digests[i]);
        for(let j = 0; j < inputs.length; j++) {
            let input = inputs[j] as noop;
            let input_buffer = Buffer.from(input.value);
            input_bytes = Buffer.concat([input_bytes, input_buffer]);
        }
    }
    console.log("Fetching Complete.");

    let file:noop_file = {cat:noop_cat, data:input_bytes};
    return file;
}

async function uploadImage(name:string, mime:string, img:Buffer) {
  let chunks = splitFile(img, 1000);
  console.log(chunks.length);
  let chunkOfChunks = splitChunks(chunks, 100);
  console.log(chunkOfChunks.length);
  return await _uploadChunkOfChunks(name, mime, chunkOfChunks);
}

async function _uploadChunks(chunks: any) {
  const txb = new TransactionBlock();
  console.log(`Adding ${chunks.length} Chunks to PTB.`);
  for (let i = 0; i < chunks.length; i++) {
    txb.moveCall({
      target: `${noop}::noop::noop`,
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

async function _uploadChunkOfChunks(name:string, mime:string, chunkOfChunks: any) {
  let digests = [];
  console.log(`Uploading: ${name} to ${network}..`);
  for (let i = 0; i < chunkOfChunks.length; i++) {
    let digest = await _uploadChunks(chunkOfChunks[i]);
    digests.push(digest);
    await sleep(100);
  }
  await sleep(100);
  return await _uploadCatInfo(name, mime, digests);
}

async function _uploadCatInfo(name:string, mime:string, digests: any) {
  const txb = new TransactionBlock();

  let metadata = Buffer.from(
    JSON.stringify({ name, mime, type: "noop/cat" })
  );
  txb.moveCall({
    target: `${noop}::noop::noop`,
    arguments: [txb.pure(bcs.vector(bcs.u8()).serialize(metadata).toBytes())],
  });
  let digest_string = Buffer.from(JSON.stringify(digests));
  txb.moveCall({
    target: `${noop}::noop::noop`,
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

function saveFile(path:string, file:noop_file) {
    let localFile = path+file.cat.name;
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
