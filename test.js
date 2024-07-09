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
Object.defineProperty(exports, "__esModule", { value: true });
const forge = __importStar(require("node-forge"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Function to load public key from PEM file
function loadPublicKey(pemFilePath) {
    return fs.readFileSync(pemFilePath, 'utf8');
}
// Function to load private key from PEM file
function loadPrivateKey(pemFilePath) {
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
// Function to decrypt data with the private key
function decryptWithPrivateKey(privateKeyPem, encryptedData) {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.decode64(encryptedData);
    const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: forge.mgf.mgf1.create(forge.md.sha256.create())
    });
    return decrypted;
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Paths to the public and private key files
    const publicKeyPath = path.resolve(__dirname, 'public_key.pem');
    const privateKeyPath = path.resolve(__dirname, 'private_key.pem');
    // Load keys
    const publicKeyPem = loadPublicKey(publicKeyPath);
    const privateKeyPem = loadPrivateKey(privateKeyPath);
    // Data to encrypt
    const data = 'secadazddazzdadaz';
    // Encrypt the data
    const encryptedData = encryptWithPublicKey(publicKeyPem, data);
    fs.writeFileSync('encrypted_data.txt', encryptedData);
    console.log('Encrypted Data:', encryptedData);
    // Decrypt the data
    const decryptedData = decryptWithPrivateKey(privateKeyPem, encryptedData);
    fs.writeFileSync('decrypted_data.txt', decryptedData);
    console.log('Decrypted Data:', decryptedData);
}))();
