const CryptoJS = require('crypto-js');

const secretKey = process.env.ENCRYPTION_KEY;

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

function decrypt(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function safeDecrypt(value) {
  try {
    const decrypted = decrypt(value);
    return decrypted || value;
  } catch {
    return value;
  }
}

module.exports = { encrypt, decrypt, safeDecrypt };
