import * as forge from 'node-forge';
import * as fs from 'fs';
import * as path from 'path';

// Function to load public key from PEM file
function loadPublicKey(pemFilePath: string): string {
    return fs.readFileSync(pemFilePath, 'utf8');
}

// Function to load private key from PEM file
function loadPrivateKey(pemFilePath: string): string {
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

// Function to decrypt data with the private key
function decryptWithPrivateKey(privateKeyPem: string, encryptedData: string): string {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const encryptedBytes = forge.util.decode64(encryptedData);
    const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
        mgf1: forge.mgf.mgf1.create(forge.md.sha256.create())
    });
    return decrypted;
}

(async () => {
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
})();
