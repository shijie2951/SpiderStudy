const CryptoJS = require('crypto-js')
password =function (pas,lol){ return  CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(pas),
     CryptoJS.enc.Utf8.parse(lol),{
            iv: CryptoJS.enc.Utf8.parse(lol),
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }).toString();
}
