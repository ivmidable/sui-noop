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
import * as bs58 from "bs58";
import zlib from "zlib";

const keypair = Ed25519Keypair.fromSecretKey(
  decodeSuiPrivateKey(wallet).secretKey
);

const client = new SuiClient({ url: getFullnodeUrl("testnet") });

const sleep = require("util").promisify(setTimeout);


const network = "testnet";
(async () => {
  try {
    // let test = fs.readFileSync("../files/out.txt", "utf-8");
    // let buffers = JSON.parse(test);
    // console.log(buffers);
    // let bytes:Uint8Array[] = [];

    // for(let i = 0; i < buffers.length; i++) {
    //     bytes.push(buffers[i].data);
    //     console.log(buffers[i].data.length);
    // }
    // console.log(bytes);

    // await _testUploadCatData("video.mp4", "video/mp4", bytes);
    let res = await _Download("../files_downloaded/", "4V9Y2cCyzXpiDeddqAhz8J93YPKipMk1jd9ar3nf5hSU");
    //openFile(res);
    //console.log(test);
    //let image = fs.readFileSync("../files/video.mp4");
    //let gz_image = zlib.gzipSync(image, {strategy});
    //let bt_image = zlib.brotliCompressSync(image);

    //console.log(image.length);
    //console.log(gz_image.length);
    //console.log(bt_image.length);
    //let noop_digest = await uploadImage("video.mp4", "video/mp4", image);
    //await sleep(300);
    //await DownloadNoopCat("9Su4GtLNCjKTa2VgV28LqrMSJt1uvdV9yuXFhXfooAmh");
    //let res = await downloadAndSave("../files/", noop_digest);
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
    //encoding: string | undefined;
    type: string | undefined;
}

interface formated {
    cat:noop_cat;
    digests:string[];
}

interface noop_file {
    cat:noop_cat;
    data: Uint8Array | string;
}

function openFile(path:string) {
    execSync(
        `open ${path}`
    );
}

async function _Download(path:string, digest:string) {
    let catData = await _getCatData(digest);
    let digests = await formatCatdata(catData);
    let data = await _downloadNoopCat(digests);
    return saveFile(path, data);
}

// async function downloadAndSave(path:string, digest:string) {
//     let catData = await _getCatData(digest);
//     let data = await _downloadNoopCat(catData);
//     return saveFile(path, data);
// }

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

async function _getCatData(digest:string) : Promise<Buffer[]> {
    let catData = [];
    
    console.log("Loading :", digest);
    let inputs = await _getNoopInputs(digest);
    for(let i = 0; i < inputs.length; i++) {
        const input = inputs[i] as noop;
        //eJAxpTwsBsuWHtzBH1c18QHUpN7xLrYdrt24JyCo1Sp
        catData.push(Buffer.from(input.value));
    }
    return catData;
}

async function formatCatdata(catData:Uint8Array[]) {
    let noop_cat:noop_cat = JSON.parse(Buffer.from(catData[0]).toString("utf8"));
    let digests: string[] = [];
    for(let i = 1; i < catData.length; i++) {
        for(let j = 0; j < catData[i].length; j) {
            let len = catData[i][j];
            //console.log(len);
            let data = new Uint8Array(catData[i].slice(j+1, j+len+1));
            //console.log(`len: ${len}, data:${data}`);
            let digest = bs58.encode(catData[i].slice(j+1, j+len+1));
            digests.push(digest);
            j = j+len+1;
        }
    }
    let formated: formated = {cat:noop_cat, digests:digests};
    return formated;
}

async function _downloadNoopCat(formated:formated) : Promise<noop_file> {
    let input_bytes = Buffer.alloc(0);
    for(let i = 0; i < formated.digests.length; i++) {
        console.log(`Fetching: ${formated.digests[i]}...`);
        let inputs = await _getNoopInputs(formated.digests[i]);
        for(let j = 0; j < inputs.length; j++) {
            let input = inputs[j] as noop;
            let input_buffer = Buffer.from(input.value);
            input_bytes = Buffer.concat([input_bytes, input_buffer]);
        }
    }
    console.log("Fetching Complete.");

    let file:noop_file = {cat:formated.cat, data:input_bytes};
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
  for (let i = 0; i < chunks.length; i++) {
    txb.moveCall({
      target: `${noop}::noop::noop`,
      arguments: [
        txb.pure(bcs.vector(bcs.u8()).serialize(chunks[i]).toBytes()),
      ],
    });
  }
  let txid = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: txb,

  });
  console.log(`Success! Check our your TX here:
        https://suiexplorer.com/txblock/${txid.digest}?network=${network}`);
  return txid.digest;
}

async function _uploadChunkOfChunks(name:string, mime:string, chunkOfChunks: any) {
  let digests = Buffer.alloc(0);
  console.log(`Uploading: ${name} to ${network}..`);
  for (let i = 0; i < chunkOfChunks.length; i++) {
    let digest = await _uploadChunks(chunkOfChunks[i]);
    let temp_buffer = bs58.decode(digest);
    let length = Buffer.alloc(1, temp_buffer.length);
    digests = Buffer.concat([digests, length, temp_buffer]);
    await sleep(25);
  }
  await sleep(100);
  return await _uploadCatInfo(name, mime, digests);
}

async function _uploadCatInfo(name:string, mime:string, digests: Uint8Array) {
  const txb = new TransactionBlock();
  let cat:noop_cat = { name:"out.txt", mime:"text", type: "noop/cat" };

  let metadata = Buffer.from(
    JSON.stringify({name,mime, type:"noop/cat"})
  );
  console.log(metadata);
  txb.moveCall({
    target: `${noop}::noop::noop`,
    arguments: [txb.pure(bcs.vector(bcs.u8()).serialize(metadata).toBytes())],
  });


  let split_digests = splitDigests(digests);
  let temp = JSON.stringify(cat) + JSON.stringify(split_digests);
  

  let file:noop_file = {cat, data:temp};
  saveFile("../files/", file);

  throw new Error("Temp break here for testing.");
  console.log(JSON.stringify(split_digests));

  if (split_digests.length > 98) {
    throw new Error("File is too large for the current version of noop/cat");
  }

  for(let i =0; i < split_digests.length; i++) {
    let digest_string = Buffer.from(JSON.stringify(split_digests));
    txb.moveCall({
        target: `${noop}::noop::noop`,
        arguments: [txb.pure(bcs.vector(bcs.u8()).serialize(digest_string).toBytes())],
      });
  }

  let txid = await client.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: txb,
  });
  console.log(`Success! Check our your TX here:
        https://suiexplorer.com/txblock/${txid.digest}?network=${network}`);
    return txid.digest;
}

async function _testUploadCatData(name:string, mime:string, split_digests:Uint8Array[]) {
    const txb = new TransactionBlock();
    let metadata = Buffer.from(
        JSON.stringify({name,mime, type:"noop/cat"})
      );
      console.log(metadata);
      txb.moveCall({
        target: `${noop}::noop::noop`,
        arguments: [txb.pure(bcs.vector(bcs.u8()).serialize(metadata).toBytes())],
      });

    if (split_digests.length > 98) {
        throw new Error("File is too large for the current version of noop/cat");
      }
    
      for(let i =0; i < split_digests.length; i++) {
        //let digest_string = Buffer.from(JSON.stringify(split_digests[i]));
        txb.moveCall({
            target: `${noop}::noop::noop`,
            arguments: [txb.pure(bcs.vector(bcs.u8()).serialize(split_digests[i]).toBytes())],
          });
      }
    
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

function splitDigests(digests: Uint8Array, maxBytes:number = 1000) {
    const chunks:Uint8Array[] = [];
    let temp = Buffer.alloc(0);
    for (let i = 0; i < digests.length; i) {
        let length = digests[i];
        if(temp.length+length > maxBytes) {
            chunks.push(temp);
            temp = Buffer.alloc(0);
        }
        temp = Buffer.concat([temp, digests.slice(i, i+length+1)]);
        i = i+length+1;
        if(i >= digests.length) {
            chunks.push(temp);
        }
    }
    console.log(`Digests: ${digests.length}; Chunk Size: ${maxBytes}; Chunks: ${chunks.length}`);
    return chunks;
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
