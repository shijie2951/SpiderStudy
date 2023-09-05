//全局对象配置
debugger;
xzvm = {
    "toolsFunc":{}, //功能函数相关，插件
}// 插件相关 
//浏览器具体接口实现
//插件功能相关
!function () {
    //主要用来保护伪造的函数  让其更难被识破
    //函数native化
    ;;;;
    (() => {
        "use strict";
        const $toString = Function.toString;
        const myFunction_toString_symbol = Symbol('('.concat('', ')_', (Math.random() + '').toString(36)));
        const myToString = function () {
            return typeof this == 'function' && this[myFunction_toString_symbol] || $toString.call(this);
        };

        function set_native(func, key, value) {
            Object.defineProperty(func, key, {
                "enumerable": false,
                "configurable": true,
                "writable": true,
                "value": value
            })
        };
        delete Function.prototype['toString'];//删除原型链上的toString
        set_native(Function.prototype, "toString", myToString);//自己定义个getter方法
        set_native(Function.prototype.toString, myFunction_toString_symbol, "function toString() { [native code] }");
        xzvm.toolsFunc.set_native = (func, funcname) => {
            set_native(func, myFunction_toString_symbol, `function ${funcname || func.name || ''}() { [native code] }`);
        };//到出函数到globalThis
    })();
    //对象重命名
    xzvm.toolsFunc.reNameObj = function reNameObj(obj, name) {
        Object.defineProperty(obj.prototype, Symbol.toStringTag, {
            configurable: true,
            enumerable: false,
            value: name,
            writable: false
        })
    }
    //抛错函数
    xzvm.toolsFunc.throwError = function throwError(name,message){
        let e = new Error();
        e.name = name;
        e.message = message;
        e.stack = `${name}: ${message}\n    at snippet:`;
        throw e;
    }
    //base64编码解码
    xzvm.toolsFunc.base64 = {};
    xzvm.toolsFunc.base64.base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    xzvm.toolsFunc.base64.base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    xzvm.toolsFunc.base64.base64encode = function base64encode(str){
            var out, i, len;
            var c1, c2, c3;
            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                c1 = str.charCodeAt(i++) & 0xff;
                if (i == len) {
                    out += xzvm.toolsFunc.base64.base64EncodeChars.charAt(c1 >> 2);
                    out += xzvm.toolsFunc.base64.base64EncodeChars.charAt((c1 & 0x3) << 4);
                    out += "==";
                    break;
                }
                c2 = str.charCodeAt(i++);
                if (i == len) {
                    out += xzvm.toolsFunc.base64.base64EncodeChars.charAt(c1 >> 2);
                    out += xzvm.toolsFunc.base64.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                    out += xzvm.toolsFunc.base64.base64EncodeChars.charAt((c2 & 0xF) << 2);
                    out += "=";
                    break;
                }
                c3 = str.charCodeAt(i++);
                out += xzvm.toolsFunc.base64.base64EncodeChars.charAt(c1 >> 2);
                out += xzvm.toolsFunc.base64.base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += xzvm.toolsFunc.base64.base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                out += xzvm.toolsFunc.base64.base64EncodeChars.charAt(c3 & 0x3F);
            }
            return out;
        }
    xzvm.toolsFunc.base64.base64decode = function base64decode(str){
    var c1, c2, c3, c4;
    var i, len, out;
    len = str.length;
    i = 0;
    out = "";
    while (i < len) {
        /* c1 */
        do {
            c1 = xzvm.toolsFunc.base64.base64DecodeChars[str.charCodeAt(i++) & 0xff];
        }
        while (i < len && c1 == -1);
        if (c1 == -1)
            break;
        /* c2 */
        do {
            c2 = xzvm.toolsFunc.base64.base64DecodeChars[str.charCodeAt(i++) & 0xff];
        }
        while (i < len && c2 == -1);
        if (c2 == -1)
            break;
        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
        /* c3 */
        do {
            c3 = str.charCodeAt(i++) & 0xff;
            if (c3 == 61)
                return out;
            c3 = xzvm.toolsFunc.base64.base64DecodeChars[c3];
        }
        while (i < len && c3 == -1);
        if (c3 == -1)
            break;
        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        /* c4 */
        do {
            c4 = str.charCodeAt(i++) & 0xff;
            if (c4 == 61)
                return out;
            c4 = xzvm.toolsFunc.base64.base64DecodeChars[c4];
        }
        while (i < len && c4 == -1);
        if (c4 == -1)
            break;
        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
    }
    return out;
}
}();
// env相关代码 
EventTarget=function EventTarget(){

}
//函数native化
xzvm.toolsFunc.set_native(EventTarget,"EventTarget")
//修改对象名称
xzvm.toolsFunc.reNameObj(EventTarget,"EventTarget")

WindowProperties=function WindowProperties(){

}
//函数native化
xzvm.toolsFunc.set_native(WindowProperties,"WindowProperties")
//修改对象名称
xzvm.toolsFunc.reNameObj(WindowProperties,"WindowProperties")
//设置WindowProperties.prototype的原型对象
Object.setPrototypeOf(WindowProperties.prototype,EventTarget.prototype);
//删除构造函数
delete WindowProperties.prototype.constructor;
//Window对象
Window = function Window() {
    xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")
}
//函数native化
xzvm.toolsFunc.set_native(Window, "Window")
//修改对象名称
xzvm.toolsFunc.reNameObj(Window, "Window")
//设置Window.prototype的原型对象
Object.setPrototypeOf(Window.prototype, WindowProperties.prototype);
//Window原型的属性
Object.defineProperty(Window, "PERSISTENT", {
    configurable: false,
    enumerable: true,
    value: 1
})
Object.defineProperty(Window, "TEMPORARY", {
    configurable: false,
    enumerable: true,
    value: 0
})
//Window.prototype:原型对象属性
Object.defineProperty(Window.prototype, "PERSISTENT", {
    configurable: false,
    enumerable: true,
    value: 1
})
Object.defineProperty(Window.prototype, "TEMPORARY", {
    configurable: false,
    enumerable: true,
    value: 0
})



//window对象
//删除浏览器中不存在的对象
delete global;
delete Buffer;
delete WindowProperties;
window = globalThis;
Object.setPrototypeOf(window,Window.prototype);


//定义window中的方法
Object.defineProperty(window,"atob",{
    value:function atob(str){
        return xzvm.toolsFunc.base64.base64decode(str);
    }
})
xzvm.toolsFunc.set_native(window.atob,"atob")

Object.defineProperty(window,"btoa",{
    value:function btoa(str){
        return xzvm.toolsFunc.base64.base64encode(str);
    }
})
xzvm.toolsFunc.set_native(window.btoa,"btoa")
//全局变量
//用户环境变量
//代理对象
//输入
debugger;
//异步执行相关
