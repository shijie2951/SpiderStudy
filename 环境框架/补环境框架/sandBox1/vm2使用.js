const {VM, VMScript} = require("vm2");
const fs = require("fs");

//创建虚拟机
const vm = new VM();
const code = fs.readFileSync("./input.js");
const script = new VMScript(code,"./正在调试");
const result = vm.run(script)
console.log(result);
fs.writeFileSync("./output.js",code);
