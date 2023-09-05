//插件功能相关
!function () {
    //实现hook插件
    xzvm.toolsFunc.hook = function (func, funcInfo, isDebug, onEnter, onLeave, isExec) {
    //func     : 原函数，需要hook的函数
    //funcInfo ：为一个对象，包含objName,funcName属性
    //isDebug  : 布尔类型，是否开启调试，关键点定位，回溯调用栈
    //onEnter  : 函数,原函数执行前执行的函数,改原函数的入参或输出入参
    //onLeave  : 函数,原函数执行后执行的函数,改原函数的返回值或输出原函数的返回值
    //isExec   : 布尔,是否执行原函数
    if (typeof func !== "function") {
        return func;
    }
    if (funcInfo === undefined) {
        funcInfo = {}
        funcInfo.objName = "globalThis";
        funcInfo.funcName = func.name || '';
    }
    if (isDebug === undefined) {
        isDebug = false;
    }
    if (!onEnter) {
        onEnter = function (obj) {
            console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}] 正在调用，参数是:${JSON.stringify(obj.args)}}`)
        }
    }
    if (!onLeave) {
        onLeave = function (obj) {
            console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}] 正在调用，返回值:${obj.result}}`)
        }
    }
    if (isExec === undefined) {
        isExec = true;
    }

    //替换的函数
    hookFunc = function () {
        if (isDebug) {
            debugger;
        }
        let obj = {};
        obj.args = [];
        for (let i = 0; i < arguments.length; i++) {
            obj.args[i] = arguments[i];
        }
        //原函数执行前
        onEnter.call(this, obj);
        //原函数正在执行
        let result;
        if (isExec) {
            result = func.apply(this, obj.args)
        }
        //原函数执行后
        obj.result = result;
        onLeave.call(this, obj);
        return obj.result;
    }
    //hook后的函数进行native化
    xzvm.toolsFunc.set_native(hookFunc, funcInfo.funcName);
    xzvm.toolsFunc.reNameFunc(hookFunc,funcInfo.funcName)
    return hookFunc
}
    //proxy代理器
    xzvm.toolsFunc.getType = function getType(obj) {
        return Object.prototype.toString.call(obj);
    }
    xzvm.toolsFunc.proxy = function proxy(obj, objName) {
        //obj :原始对象
        //objName :原始对象的名字
        if (!xzvm.config.proxy) {
            return obj;
        }
        let handler = {
            get: function (target, prop, receiver) {
                let result;
                try {
                    result = Reflect.get(target, prop, receiver);
                    let type = xzvm.toolsFunc.getType(result)
                    if (result instanceof Object) {
                        console.log(`{get |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${type}]}`);
                        //递归代理
                        result = xzvm.toolsFunc.proxy(result, `${objName}.${prop.toString()}`)
                    } else if (typeof result === "symbol") {
                        console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result.toString()}]}`);
                    } else {
                        console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result}]}`);
                    }
                } catch (e) {
                    console.log(`{get |obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
                }
                return result;
            },
            set: function (target, prop, value, receiver) {
                let result;
                try {
                    result = Reflect.set(target, prop, value, receiver);
                    let type = xzvm.toolsFunc.getType(value)
                    if (result instanceof Object) {
                        console.log(`{set |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${value}]}`);
                        //递归代理
                    } else if (typeof result === "symbol") {
                        console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result.toString()}]}`);
                    } else {
                        console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result}]}`);
                    }
                } catch (e) {
                    console.log(`{set |obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
                }
                return result;
            },
            getOwnPropertyDescriptor: function (target, prop) {
                let result; //undefined，描述符对象
                try {
                    result = Reflect.getOwnPropertyDescriptor(target, prop);
                    let type = xzvm.toolsFunc.getType(result);
                    console.log(`{getOwnPropertyDescriptor |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${type}]}`);
                    // if (typeof result!=="undefined"){
                    //     result=xzvm.toolsFunc.proxy(result,`${objName}.${prop.toString()}.PropertyDescriptor`)
                    // }
                } catch (e) {
                    console.log(`{getOwnPropertyDescriptor |obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
                }
                return result;
            },
            defineProperty: function (target, prop, descriptor) {
                let result; //undefined，描述符对象
                try {
                    result = Reflect.defineProperty(target, prop, descriptor);
                    console.log(`{defineProperty |obj:[${objName}] -> prop:[${prop.toString()}]`);
                } catch (e) {
                    console.log(`{defineProperty |obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
                }
                return result;
            },
            apply: function (target, thisArg, argumentsList) {
                //target : 函数对象
                //thisArg : 调用函数的this指针
                //argumentsList: 数组，函数的入参组成的一个列表
                let result;
                try {
                    result = Reflect.apply(target, thisArg, argumentsList)
                    let type = xzvm.toolsFunc.getType(result)
                    if (result instanceof Object) {
                        console.log(`{apply |function:[${objName}]  -> type:[${type}]}`);
                    } else if (typeof result === "symbol") {
                        console.log(`{apply|function:[${objName}], result:[${result.toString()}]}`);
                    } else {
                        console.log(`{apply|function:[${objName}], result:[${result}]}`);
                    }

                } catch (e) {
                    console.log(`{apply |function:[${objName}], error[${e.message}}]`);
                }
                return result;
            },
            construct: function (target, argArray, newTarget) {
                //target : 函数对象
                //argArray : 参数列表
                //newTarget: 代理对象
                let result;
                try {
                    result = Reflect.construct(target, argArray, newTarget)
                    let type = xzvm.toolsFunc.getType(result)
                    console.log(`{construct |function:[${objName}]  -> type:[${type}]}`);

                } catch (e) {
                    console.log(`{construct |function:[${objName}], error[${e.message}}]`);
                }
                return result;
            },
            deleteProperty: function (target, propKey) {
                let result = Reflect.deleteProperty(target, propKey);
                console.log(`{deleteProperty |obj:[${objName}] -> prop:[${propKey.toString()}] -> result:[${result}]}`);
                return result;
            },
            has: function (target, propKey) { //in操作
                let result = Reflect.has(target, propKey);
                console.log(`{has |obj:[${objName}] -> prop:[${propKey.toString()}] -> result:[${result}]}`);
                return result;
            },
            ownKeys: function (target) {
                let result = Reflect.ownKeys(target);
                console.log(`{ownKeys |obj:[${objName}]}`);
                return result;
            },
            getPrototypeOf: function (target) {
                let result = Reflect.getPrototypeOf(target);
                console.log(`{getPrototypeOf |obj:[${objName}]}`);
                return result;
            },
            setPrototypeOf: function (target, proto) {
                let result = Reflect.setPrototypeOf(target, proto);
                console.log(`{setPrototypeOf |obj:[${objName}]}`);
                return result;
            },
            preventExtensions: function (target) {
                let result = Reflect.preventExtensions(target);
                console.log(`{preventExtensions |obj:[${objName}]}`);
                return result;
            },
            isExtensible: function (target) {
                let result = Reflect.isExtensible(target);
                console.log(`{isExtensible |obj:[${objName}]}`);
                return result;
            }
        };
        return new Proxy(obj, handler)
    }
    //env函数分发器
    xzvm.toolsFunc.dispatch = function dispatch(self, obj, objName, funcName, argList, defaultValue) {
        let name = `${objName}_${funcName}`
        try {
            return xzvm.envFunc[name].apply(self, argList);
        } catch (e) {
            if (defaultValue === undefined) {
                console.log(`[${name}]正在执行，错误信息: ${e.message}`);
            }
            return defaultValue;
        }
    }
    //定义对象属性defineProperty
    xzvm.toolsFunc.defineProperty = function defineProperty(obj, prop, oldDescriptor) {
        let newDescriptor = {};
        newDescriptor.configurable = xzvm.config.proxy || oldDescriptor.configurable; //如果开启代理必须为true
        newDescriptor.enumerable = oldDescriptor.enumerable;
        if (oldDescriptor.hasOwnProperty("writable")) {
            newDescriptor.writable = oldDescriptor.writable;
        }
        if (oldDescriptor.hasOwnProperty("value")) {
            let value = oldDescriptor.value;
            if (typeof value === "function") {
                xzvm.toolsFunc.safeFunc(value, prop)
            }
            newDescriptor.value = value;
        }
        if (oldDescriptor.hasOwnProperty("get")) {
            let get = oldDescriptor.get;
            if (typeof get === "function") {
                xzvm.toolsFunc.safeFunc(get, `get ${prop}`)
            }
            newDescriptor.get = get;
        }
        if (oldDescriptor.hasOwnProperty("set")) {
            let set = oldDescriptor.set;
            if (typeof set === "function") {
                xzvm.toolsFunc.safeFunc(set, `set ${prop}`)
            }
            newDescriptor.set = set;
        }
        Object.defineProperty(obj, prop, newDescriptor);
    }
    //主要用来保护伪造的函数  让其更难被识破
    //函数native化
    !function () {
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
    }();
    //对象重命名
    xzvm.toolsFunc.reNameObj = function reNameObj(obj, name) {
        Object.defineProperty(obj.prototype, Symbol.toStringTag, {
            configurable: true,
            enumerable: false,
            value: name,
            writable: false
        })
    }
    //函数重命名
    xzvm.toolsFunc.reNameFunc = function reNameFunc(func, name) {
        Object.defineProperty(func, "name", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: name
        })
    }
    //函数保护方法
    xzvm.toolsFunc.safeFunc = function safeFunc(func, name) {
        xzvm.toolsFunc.set_native(func, name);
        xzvm.toolsFunc.reNameFunc(func, name);
    }
    //原型保护方法
    xzvm.toolsFunc.safeProto = function safeProto(obj, name) {
        xzvm.toolsFunc.set_native(obj, name);
        xzvm.toolsFunc.reNameObj(obj, name);
    }
    //抛错函数
    xzvm.toolsFunc.throwError = function throwError(name, message) {
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
    xzvm.toolsFunc.base64.base64encode = function base64encode(str) {
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
    xzvm.toolsFunc.base64.base64decode = function base64decode(str) {
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