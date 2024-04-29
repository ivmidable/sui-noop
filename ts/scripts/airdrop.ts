import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { getFaucetHost, getFaucetRequestStatus, requestSuiFromFaucetV0, requestSuiFromFaucetV1 } from "@mysten/sui.js/faucet";
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import wallet from "../wallet.json"

const keypair = Ed25519Keypair.fromSecretKey(decodeSuiPrivateKey(wallet).secretKey);
console.log(keypair.getPublicKey());
//const keypair = Ed25519Keypair.fromSecretKey());
//const keypair = new Ed25519Keypair()

(async () => {
    try {
        let res = await requestSuiFromFaucetV1({
            host: getFaucetHost("testnet"),
            recipient: keypair.toSuiAddress()
          });
          console.log(res);

          if (res.task == undefined)
            throw "task is undefined";

          let status = await getFaucetRequestStatus({
            host: getFaucetHost("testnet"),
            taskId: res.task,
            headers:{}
          });
          console.log(status)
          //console.log(`Success! Check our your TX here:
          //https://suiexplorer.com/txblock/${res.transferredGasObjects[0].transferTxDigest}?network=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();