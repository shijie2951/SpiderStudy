const fs = require("fs");

function getCode(name, type) {
    try {
        return fs.readFileSync(`./user/${name}/${type}.js`)+"\r\n"
    } catch (e) {
        console.log(`./user/${name}/${type}.js 不存在 \r\n`);
        return ""
    }

}

module.exports = {
    getCode
}