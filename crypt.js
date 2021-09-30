// crypto module
const config = require('./Config/index');
const crypto = require("crypto");
const algorithm = "aes-256-cbc"; 
const Securitykey = config.AESSecurityKey;
const initVector = config.AESInitVector;

// generation key from SecurityKey
const key = crypto.createHash('sha256').update(String(Securitykey)).digest('base64').substr(0, 32);


function encode (data) {
    // the cipher function
    const cipher = crypto.createCipheriv(algorithm, key, initVector);
    let encryptedData = cipher.update(data, "utf-8", "hex");
    encryptedData += cipher.final('hex');
    return encryptedData;
}


function decode (encodedData) {
    // the cipher function
    const decipher = crypto.createDecipheriv(algorithm, key, initVector);
    let data = decipher.update(encodedData, "hex", "utf-8");
    data += decipher.final('utf-8');
    return data;
}

module.exports = {
    encode,
    decode
}