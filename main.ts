//if the algosdk is not installed, run the following command in the terminal: npm install algosdk
try {
  require.resolve("algosdk");
} catch (e) {
  console.log("algosdk is not installed, please run npm install algosdk");
  process.exit(1);
}
import * as algosdk from "algosdk";
import config from "./config.json";
import * as forge from 'node-forge';
import * as fs from 'fs';
import * as path from 'path';

// Function to load public key from PEM file
function loadPublicKey(pemFilePath: string): string {
  return fs.readFileSync(pemFilePath, 'utf8');
}

// Function to encrypt data with the public key
function encryptWithPublicKey(publicKeyPem: string, data: string): string {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(data, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: forge.mgf.mgf1.create(forge.md.sha256.create())
  });
  return forge.util.encode64(encrypted);
}


const token = '';
const server = 'https://xna-mainnet-api.algonode.cloud/';
const tokenToSend = {
  'X-API-Key': token
};
const port = 443;
const client = new algosdk.Algodv2(tokenToSend, server, port);
(async () => {

const publicKeyPath = path.resolve(__dirname, 'public_key.pem');
if(!fs.existsSync(publicKeyPath)) {
  console.error('Public key file not found');
  process.exit(1);
}
const publicKeyPem = loadPublicKey(publicKeyPath);
if(!config.miner_key || config.miner_key === 'your miner key') {
  console.error('Please set your miner key in the config.json file');
  process.exit(1);
}
const encryptedData = encryptWithPublicKey(publicKeyPem, config.miner_key);


  console.log(await client.status().do());

  const account = algosdk.mnemonicToSecretKey(config.main_account_mnemonic);
  //send the same amount to each address of FrysCrypto (FRY) which has a contract number: 924268058
  const FRYamount = config.amount_in_FRY;
  const enc = new TextEncoder();
  const note = enc.encode(encryptedData);
  const params = await client.getTransactionParams().do();
  const address = "DSOPUQC7P5WO3C32HKZONPW4MMBEQ6FGAN456PNG4A4HTRE322ZMMIK6S4"; //FrysCrypto (FRY) address
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: address,
    amount: FRYamount,
    assetIndex: config.asset_index,
    note: note,
    suggestedParams: params,
  });
  //convert the account sk object to Uint8Array
  const signedTxn = txn.signTxn(account.sk);
  const tx = await client.sendRawTransaction(signedTxn).do();
  console.log("Transaction : " + tx.txId);
})().catch((e) => {
  console.log(
    "An error occured, please check your network / mnemonic / asset index"
  );
  console.log(e);
});
