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
        const task = "e76dafa3-3307-4014-9588-09049392f172"

          let status = await getFaucetRequestStatus({
            host: getFaucetHost("testnet"),
            taskId: task
          });
          console.log(status)
          //console.log(`Success! Check our your TX here:
          //https://suiexplorer.com/txblock/${res.transferredGasObjects[0].transferTxDigest}?network=devnet`);
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();