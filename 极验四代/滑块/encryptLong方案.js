



/*
解决方案:
npm install node-encrypt-js => JSEncrypt
 */


// npm install node-encrypt-js   解决RSA 明文过长...
// node-jsencrpt
// require('node-jsencrypt') 常见RSA加密逻辑

JSEncrypt = require('node-encrypt-js')
const jsEncrypt = new JSEncrypt()
function fn(data ){
 jsEncrypt.setPublicKey("09abcca0e5e8090eb4659cea488dcaa00e1a6962834d85d28d60992ad6e15192f1ad5cc07b26903ef47375f4e33065395131de00f834864c57150255eed6e99075c5a0edf749a89f227f4398d28eeaca92c45405adb9a9d98eddfe844e77c022b33a311654d784d9a5e7d62b1033e1e0110cdad161e128e4255bc8500d1cb7db")
 return  jsEncrypt.encryptLong(data);
}


console.log(fn("9557c14170a31bf5"));


