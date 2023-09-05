var tt = '{"gjbq":"1","fpztDm":["01","02","03","04"],"fplyDm":"0","fplxDm":[],"kprqq":"2023-05-16","kprqz":"2023-06-01","tfrqq":"2023-05-16",' +
    '"tfrqz":"2023-06-01","dtBz":"N","pageNumber":1,"pageSize":10}'



var o="PEVXRrXbPB872ACkysGatSVYFpyYijZt"

// tt= 随机十六位字母拼接t
var t=o+tt

var e="b16f0e96919ba453e397b2a61ed0b7c9"   //随机数

var CryptoJS=require('crypto-js')

//封装使用AES加密的方法
//jmbw:
function AES_encrypt(t, e) {
        let a = CryptoJS.enc.Utf8.parse(t);
        var o=CryptoJS.enc.Utf8.parse(e)
        let encrypted = CryptoJS.AES.encrypt(a, o, {  mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.toString()
}

console.log(AES_encrypt(t, e));
// console.log(CryptoJS.enc.Utf8.parse(e));

//uuid=new Date().valueOf()
var uuid=new Date().valueOf()

var signStr=e+"+szzhzz/qlfpcx/v1/queryFpjcxx?ruuid="+uuid

//urlyzm:    md5加密
function md5(signStr){
  return  CryptoJS.MD5(signStr).toString()
}
console.log(md5(signStr))
