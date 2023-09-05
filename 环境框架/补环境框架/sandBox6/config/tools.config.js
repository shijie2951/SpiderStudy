const fs = require("fs");

function getFile(name){
    try {
        return fs.readFileSync(`./tools/${name}.js`)+"\r\n"
    } catch (e) {
        console.log(`./tools/${name}.js 不存在 \r\n`);
        return ""
    }
}

function getCode() {
    let code="// 插件相关 \r\n"
    code+=getFile("envFunc")
    code+=getFile("toolsFunc")
    return code

}

module.exports = {
    getCode,getFile
}