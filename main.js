"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//if the algosdk is not installed, run the following command in the terminal: npm install algosdk
try {
    require.resolve("algosdk");
}
catch (e) {
    console.log("algosdk is not installed, please run npm install algosdk");
    process.exit(1);
}
const algosdk = __importStar(require("algosdk"));
const config_json_1 = __importDefault(require("./config.json"));
const forge = __importStar(require("node-forge"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Function to load public key from PEM file
function loadPublicKey(pemFilePath) {
    return fs.readFileSync(pemFilePath, 'utf8');
}
// Function to encrypt data with the public key
function encryptWithPublicKey(publicKeyPem, data) {
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const publicKeyPath = path.resolve(__dirname, 'public_key.pem');
    if (!fs.existsSync(publicKeyPath)) {
        console.error('Public key file not found');
        process.exit(1);
    }
    const publicKeyPem = loadPublicKey(publicKeyPath);
    if (!config_json_1.default.miner_key || config_json_1.default.miner_key === 'your miner key') {
        console.error('Please set your miner key in the config.json file');
        process.exit(1);
    }
    const encryptedData = encryptWithPublicKey(publicKeyPem, config_json_1.default.miner_key);
    console.log(yield client.status().do());
    const account = algosdk.mnemonicToSecretKey(config_json_1.default.main_account_mnemonic);
    //send the same amount to each address of FrysCrypto (FRY) which has a contract number: 924268058
    const FRYamount = config_json_1.default.amount_in_FRY;
    const enc = new TextEncoder();
    const note = enc.encode(encryptedData);
    const params = yield client.getTransactionParams().do();
    const address = "DSOPUQC7P5WO3C32HKZONPW4MMBEQ6FGAN456PNG4A4HTRE322ZMMIK6S4"; //FrysCrypto (FRY) address
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: account.addr,
        to: address,
        amount: FRYamount,
        assetIndex: config_json_1.default.asset_index,
        note: note,
        suggestedParams: params,
    });
    //convert the account sk object to Uint8Array
    const signedTxn = txn.signTxn(account.sk);
    const tx = yield client.sendRawTransaction(signedTxn).do();
    console.log("Transaction : " + tx.txId);
}))().catch((e) => {
    console.log("An error occured, please check your network / mnemonic / asset index");
    console.log(e);
});
