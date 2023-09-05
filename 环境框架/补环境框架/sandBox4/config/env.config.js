const fs = require("fs");

function getFile(name){
    try {
        return fs.readFileSync(`./env/${name}.js`)+"\r\n"
    } catch (e) {
        console.log(`./tools/${name}.js 不存在 \r\n`);
        return ""
    }
}

function getCode() {
    let code="// env相关代码 \r\n"
    code+=getFile("EventTarget")
    code+=getFile("WindowProperties")
    code+=getFile("Window")


    code+=getFile("globalThis") //全局环境
    return code

}

module.exports = {
    getCode,getFile
}