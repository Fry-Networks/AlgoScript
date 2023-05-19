//if the algosdk is not installed, run the following command in the terminal: npm install algosdk
try {
  require.resolve("algosdk");
} catch (e) {
  console.log("algosdk is not installed, please run npm install algosdk");
  process.exit(1);
}
const token = "";
const server = "https://mainnet-algorand.api.purestake.io/ps2";
const port = 443;
import * as algosdk from "algosdk";
const client = new algosdk.Algodv2(token, server, port);
import config from "./config.json";
import fs from "fs";
import * as readline from "readline";
(async () => {
  console.log(await client.status().do());

  if (config.main_account_mnemonic == "your main account mnemonic") {
    //ask the user to enter their main account mnemonic via the command line

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const question = (query: string) =>
      new Promise((resolve) => rl.question(query, resolve));
    const main_account_mnemonic = await question(
      "Please enter your main account mnemonic: "
    );
    rl.close();
    //update the config.json file with the new main account mnemonic
    config.main_account_mnemonic = main_account_mnemonic as string;
    fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
    console.log(
      "Successfully updated your main account mnemonic in config.json"
    );
  }
  const account = algosdk.mnemonicToSecretKey(config.main_account_mnemonic);
  //send the same amount to each address of FrysCrypto (FRY) which has a contract number: 924268058
  const FRYamount = config.amount_in_FRY;
  const enc = new TextEncoder();
  const note = enc.encode(config.note_to_send);
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
