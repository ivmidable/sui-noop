import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import {decodeSuiPrivateKey} from "@mysten/sui.js/cryptography";
import { fromB64, toHEX } from "@mysten/sui.js/utils";

//Generate a new keypair
let kp = Ed25519Keypair.generate()

console.log(kp.getPublicKey());

console.log(kp.getKeyScheme());

console.log(`You've generated a new Sui wallet: ${kp.toSuiAddress()}

To save your wallet, copy and paste the following into a JSON file:

${kp.getSecretKey()}\n
\n`);