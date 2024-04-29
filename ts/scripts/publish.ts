import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import {normalizeSuiObjectId, fromB64} from "@mysten/sui.js/utils";
import { TransactionBlock } from '@mysten/sui.js/transactions';
import wallet from "../wallet.json"
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";

const network = "testnet";

const keypair = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(wallet).secretKey);
console.log(keypair.getPublicKey());
const client = new SuiClient({ url: getFullnodeUrl(network) });

interface Program {
    modules: string[];
    dependencies: string[];
}

// wallet address
// 0x1b0437d3af581bedbde7607c2d6babc55d99801db3815cbbe6cecec6b78acd7e

(async () => {
    try {
        let program = buildPackage("../sources/push.move");
        
        console.log(program);
        const txb = new TransactionBlock();

        const [upgradeCap] = txb.publish({
            modules: program.modules.map((m) => Array.from(fromB64(m))),
            dependencies: program.dependencies.map((d) => normalizeSuiObjectId(d)),
          });
      
          // Transfer upgrade capability to deployer
          txb.transferObjects([upgradeCap], txb.pure(await keypair.toSuiAddress()));

          txb.setGasBudget(10000000000);

        let txid = await client.signAndExecuteTransactionBlock({ signer: keypair, transactionBlock: txb, options:{showObjectChanges:true} });
        
        console.log(`Success! Check our your TX here:
        https://suiexplorer.com/txblock/${txid.digest}?network=${network}\n`);

        console.log(txid);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();

function buildPackage(packagePath: string): Program {
    if (!fs.existsSync(packagePath)) {
      throw new Error(`Package not found at ${packagePath}`);
    }

    let absolutePath = path.resolve(packagePath);

    return JSON.parse(
      execSync(
        `sui move build --dump-bytecode-as-base64 --path ${absolutePath}`,
        {
          encoding: "utf-8",
        }
      )
    );
  };