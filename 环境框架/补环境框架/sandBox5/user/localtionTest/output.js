//全局对象配置
debugger;
xzvm = {
    "toolsFunc":{}, //功能函数相关，插件
    "envFunc":{},  //具体环境实现相关
    "config":{}, //配置相关
}
xzvm.config.proxy = false  //是否开启代理// 插件相关 
//浏览器具体接口实现
!function () {
    xzvm.envFunc.Storage_getItem = function Storage_getItem() {
        return null;
    }
    xzvm.envFunc.document_location_get = function document_location_get(){
        return location;
    }
}();
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
// env相关代码 
//EventTarget对象
EventTarget = function EventTarget() {}
xzvm.toolsFunc.safeProto(EventTarget,"EventTarget");
xzvm.toolsFunc.defineProperty(EventTarget.prototype, "addEventListener", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","addEventListener",arguments);}});
xzvm.toolsFunc.defineProperty(EventTarget.prototype, "dispatchEvent", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","dispatchEvent",arguments);}});
xzvm.toolsFunc.defineProperty(EventTarget.prototype, "removeEventListener", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","removeEventListener",arguments);}});

WindowProperties=function WindowProperties(){

}
//保护原型
xzvm.toolsFunc.safeProto(WindowProperties,"WindowProperties")
//设置WindowProperties.prototype的原型对象
Object.setPrototypeOf(WindowProperties.prototype,EventTarget.prototype);
//删除构造函数
delete WindowProperties.prototype.constructor;
//Window对象
Window = function Window() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(Window,"Window");
Object.setPrototypeOf(Window.prototype, WindowProperties.prototype);
xzvm.toolsFunc.defineProperty(Window, "TEMPORARY", {enumerable: true, configurable: false,writable: false,value: 0});
xzvm.toolsFunc.defineProperty(Window, "PERSISTENT", {enumerable: true, configurable: false,writable: false,value: 1});
xzvm.toolsFunc.defineProperty(Window.prototype, "TEMPORARY", {enumerable: true, configurable: false,writable: false,value: 0});
xzvm.toolsFunc.defineProperty(Window.prototype, "PERSISTENT", {enumerable: true, configurable: false,writable: false,value: 1});

//Node对象
Node = function Node() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(Node,"Node");
Object.setPrototypeOf(Node.prototype, EventTarget.prototype);
xzvm.toolsFunc.defineProperty(Node, "ELEMENT_NODE", {enumerable: true, configurable: false,writable: false,value: 1});
xzvm.toolsFunc.defineProperty(Node, "ATTRIBUTE_NODE", {enumerable: true, configurable: false,writable: false,value: 2});
xzvm.toolsFunc.defineProperty(Node, "TEXT_NODE", {enumerable: true, configurable: false,writable: false,value: 3});
xzvm.toolsFunc.defineProperty(Node, "CDATA_SECTION_NODE", {enumerable: true, configurable: false,writable: false,value: 4});
xzvm.toolsFunc.defineProperty(Node, "ENTITY_REFERENCE_NODE", {enumerable: true, configurable: false,writable: false,value: 5});
xzvm.toolsFunc.defineProperty(Node, "ENTITY_NODE", {enumerable: true, configurable: false,writable: false,value: 6});
xzvm.toolsFunc.defineProperty(Node, "PROCESSING_INSTRUCTION_NODE", {enumerable: true, configurable: false,writable: false,value: 7});
xzvm.toolsFunc.defineProperty(Node, "COMMENT_NODE", {enumerable: true, configurable: false,writable: false,value: 8});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_NODE", {enumerable: true, configurable: false,writable: false,value: 9});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_TYPE_NODE", {enumerable: true, configurable: false,writable: false,value: 10});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_FRAGMENT_NODE", {enumerable: true, configurable: false,writable: false,value: 11});
xzvm.toolsFunc.defineProperty(Node, "NOTATION_NODE", {enumerable: true, configurable: false,writable: false,value: 12});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_DISCONNECTED", {enumerable: true, configurable: false,writable: false,value: 1});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_PRECEDING", {enumerable: true, configurable: false,writable: false,value: 2});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_FOLLOWING", {enumerable: true, configurable: false,writable: false,value: 4});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_CONTAINS", {enumerable: true, configurable: false,writable: false,value: 8});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_CONTAINED_BY", {enumerable: true, configurable: false,writable: false,value: 16});
xzvm.toolsFunc.defineProperty(Node, "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC", {enumerable: true, configurable: false,writable: false,value: 32});
xzvm.toolsFunc.defineProperty(Node.prototype, "nodeType", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","nodeType_get",arguments,9)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "nodeName", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","nodeName_get",arguments,"#document")},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "baseURI", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","baseURI_get",arguments,"https://newtab.uniontech.com/")},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "isConnected", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","isConnected_get",arguments,true)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "ownerDocument", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","ownerDocument_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "parentNode", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","parentNode_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "parentElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","parentElement_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "childNodes", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","childNodes_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "firstChild", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","firstChild_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "lastChild", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","lastChild_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "previousSibling", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","previousSibling_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "nextSibling", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","nextSibling_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Node.prototype, "nodeValue", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","nodeValue_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","nodeValue_set",arguments)}});
xzvm.toolsFunc.defineProperty(Node.prototype, "textContent", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","textContent_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","textContent_set",arguments)}});
xzvm.toolsFunc.defineProperty(Node.prototype, "ELEMENT_NODE", {enumerable: true, configurable: false,writable: false,value: 1});
xzvm.toolsFunc.defineProperty(Node.prototype, "ATTRIBUTE_NODE", {enumerable: true, configurable: false,writable: false,value: 2});
xzvm.toolsFunc.defineProperty(Node.prototype, "TEXT_NODE", {enumerable: true, configurable: false,writable: false,value: 3});
xzvm.toolsFunc.defineProperty(Node.prototype, "CDATA_SECTION_NODE", {enumerable: true, configurable: false,writable: false,value: 4});
xzvm.toolsFunc.defineProperty(Node.prototype, "ENTITY_REFERENCE_NODE", {enumerable: true, configurable: false,writable: false,value: 5});
xzvm.toolsFunc.defineProperty(Node.prototype, "ENTITY_NODE", {enumerable: true, configurable: false,writable: false,value: 6});
xzvm.toolsFunc.defineProperty(Node.prototype, "PROCESSING_INSTRUCTION_NODE", {enumerable: true, configurable: false,writable: false,value: 7});
xzvm.toolsFunc.defineProperty(Node.prototype, "COMMENT_NODE", {enumerable: true, configurable: false,writable: false,value: 8});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_NODE", {enumerable: true, configurable: false,writable: false,value: 9});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_TYPE_NODE", {enumerable: true, configurable: false,writable: false,value: 10});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_FRAGMENT_NODE", {enumerable: true, configurable: false,writable: false,value: 11});
xzvm.toolsFunc.defineProperty(Node.prototype, "NOTATION_NODE", {enumerable: true, configurable: false,writable: false,value: 12});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_DISCONNECTED", {enumerable: true, configurable: false,writable: false,value: 1});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_PRECEDING", {enumerable: true, configurable: false,writable: false,value: 2});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_FOLLOWING", {enumerable: true, configurable: false,writable: false,value: 4});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_CONTAINS", {enumerable: true, configurable: false,writable: false,value: 8});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_CONTAINED_BY", {enumerable: true, configurable: false,writable: false,value: 16});
xzvm.toolsFunc.defineProperty(Node.prototype, "DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC", {enumerable: true, configurable: false,writable: false,value: 32});
xzvm.toolsFunc.defineProperty(Node.prototype, "appendChild", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","appendChild",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "cloneNode", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","cloneNode",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "compareDocumentPosition", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","compareDocumentPosition",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "contains", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","contains",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "getRootNode", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","getRootNode",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "hasChildNodes", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","hasChildNodes",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "insertBefore", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","insertBefore",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "isDefaultNamespace", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","isDefaultNamespace",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "isEqualNode", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","isEqualNode",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "isSameNode", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","isSameNode",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "lookupNamespaceURI", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","lookupNamespaceURI",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "lookupPrefix", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","lookupPrefix",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "normalize", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","normalize",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "removeChild", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","removeChild",arguments);}});
xzvm.toolsFunc.defineProperty(Node.prototype, "replaceChild", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Node.prototype,"Node","replaceChild",arguments);}});

//Document对象
Document = function Document() {}
xzvm.toolsFunc.safeProto(Document,"Document");
Object.setPrototypeOf(Document.prototype, Node.prototype);
xzvm.toolsFunc.defineProperty(Document.prototype, "implementation", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","implementation_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "URL", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","URL_get",arguments,"https://newtab.uniontech.com/")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "documentURI", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","documentURI_get",arguments,"https://newtab.uniontech.com/")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "compatMode", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","compatMode_get",arguments,"CSS1Compat")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "characterSet", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","characterSet_get",arguments,"UTF-8")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "charset", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","charset_get",arguments,"UTF-8")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "inputEncoding", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","inputEncoding_get",arguments,"UTF-8")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "contentType", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","contentType_get",arguments,"text/html")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "doctype", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","doctype_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "documentElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","documentElement_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "xmlEncoding", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlEncoding_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "xmlVersion", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlVersion_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlVersion_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "xmlStandalone", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlStandalone_get",arguments,false)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","xmlStandalone_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "domain", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","domain_get",arguments,"newtab.uniontech.com")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","domain_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "referrer", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","referrer_get",arguments,"")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "cookie", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","cookie_get",arguments,"_nano_fp=XpEJn5mqnqXblpXJno_6BRBaLD48wY2nXdqhjeg5; WEBDFPID=1687223119049UOMMCYAa12a6b8169ee7736639f3ec62dbf984b3950-1687223119049-1687223119049UOMMCYAa12a6b8169ee7736639f3ec62dbf984b3950; gdxidpyhxdE=RznrdA9nxsWs%5CSZOm%2F1h42Y2C2saklngqKUxqhc%5CkUYgoCkLzCReYw%5CiS13B151vwVBywY2SwAdobpShQu4pOgO5WPICzVW4%2BK0qkASE8AaW16aozpn4kIP3trpbshvW7n2m8Hg%5Cb0OlZsW077iK3EpIAgD%2BHnMXHAYVgIoXQYDiE3mo%3A1687769372019")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","cookie_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "lastModified", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","lastModified_get",arguments,"05/26/2023 08:39:56")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "readyState", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","readyState_get",arguments,"complete")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "title", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","title_get",arguments,"新标签页")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","title_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "dir", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","dir_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","dir_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "body", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","body_get",arguments)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","body_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "head", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","head_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "images", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","images_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "embeds", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","embeds_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "plugins", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","plugins_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "links", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","links_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "forms", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","forms_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "scripts", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","scripts_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "currentScript", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","currentScript_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "defaultView", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","defaultView_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "designMode", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","designMode_get",arguments,"off")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","designMode_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onreadystatechange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onreadystatechange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onreadystatechange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "anchors", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","anchors_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "applets", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","applets_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "fgColor", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fgColor_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fgColor_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "linkColor", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","linkColor_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","linkColor_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "vlinkColor", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","vlinkColor_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","vlinkColor_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "alinkColor", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","alinkColor_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","alinkColor_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "bgColor", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","bgColor_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","bgColor_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "all", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","all_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "scrollingElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","scrollingElement_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerlockchange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerlockchange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerlockchange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerlockerror", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerlockerror_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerlockerror_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "hidden", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","hidden_get",arguments,false)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "visibilityState", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","visibilityState_get",arguments,"visible")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "wasDiscarded", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","wasDiscarded_get",arguments,false)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "featurePolicy", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","featurePolicy_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "webkitVisibilityState", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitVisibilityState_get",arguments,"visible")},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "webkitHidden", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitHidden_get",arguments,false)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "onbeforecopy", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforecopy_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforecopy_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onbeforecut", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforecut_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforecut_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onbeforepaste", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforepaste_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforepaste_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onfreeze", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfreeze_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfreeze_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onresume", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onresume_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onresume_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onsearch", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsearch_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsearch_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onsecuritypolicyviolation", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsecuritypolicyviolation_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsecuritypolicyviolation_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onvisibilitychange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onvisibilitychange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onvisibilitychange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "fullscreenEnabled", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreenEnabled_get",arguments,true)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreenEnabled_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "fullscreen", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreen_get",arguments,false)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreen_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onfullscreenchange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfullscreenchange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfullscreenchange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onfullscreenerror", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfullscreenerror_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfullscreenerror_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "webkitIsFullScreen", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitIsFullScreen_get",arguments,false)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "webkitCurrentFullScreenElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitCurrentFullScreenElement_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "webkitFullscreenEnabled", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitFullscreenEnabled_get",arguments,true)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "webkitFullscreenElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitFullscreenElement_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "onwebkitfullscreenchange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitfullscreenchange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitfullscreenchange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onwebkitfullscreenerror", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitfullscreenerror_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitfullscreenerror_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "rootElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","rootElement_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "onbeforexrselect", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforexrselect_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onbeforexrselect_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onabort", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onabort_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onabort_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onblur", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onblur_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onblur_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oncancel", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncancel_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncancel_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oncanplay", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncanplay_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncanplay_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oncanplaythrough", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncanplaythrough_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncanplaythrough_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onchange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onchange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onchange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onclick", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onclick_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onclick_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onclose", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onclose_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onclose_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oncontextmenu", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontextmenu_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncontextmenu_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oncuechange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncuechange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncuechange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondblclick", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondblclick_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondblclick_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondrag", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondrag_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondrag_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondragend", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragend_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragend_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondragenter", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragenter_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragenter_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondragleave", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragleave_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragleave_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondragover", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragover_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragover_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondragstart", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragstart_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondragstart_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondrop", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondrop_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondrop_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ondurationchange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondurationchange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ondurationchange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onemptied", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onemptied_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onemptied_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onended", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onended_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onended_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onerror", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onerror_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onerror_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onfocus", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfocus_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onfocus_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onformdata", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onformdata_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onformdata_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oninput", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oninput_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oninput_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oninvalid", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oninvalid_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oninvalid_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onkeydown", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeydown_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeydown_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onkeypress", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeypress_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeypress_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onkeyup", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeyup_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onkeyup_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onload", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onload_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onload_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onloadeddata", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadeddata_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadeddata_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onloadedmetadata", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadedmetadata_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadedmetadata_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onloadstart", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadstart_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onloadstart_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onmousedown", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousedown_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousedown_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onmouseenter", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseenter_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseenter_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onmouseleave", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseleave_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseleave_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onmousemove", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousemove_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousemove_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onmouseout", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseout_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseout_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onmouseover", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseover_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseover_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onmouseup", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseup_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmouseup_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onmousewheel", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousewheel_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onmousewheel_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpause", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpause_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpause_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onplay", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onplay_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onplay_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onplaying", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onplaying_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onplaying_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onprogress", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onprogress_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onprogress_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onratechange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onratechange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onratechange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onreset", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onreset_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onreset_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onresize", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onresize_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onresize_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onscroll", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onscroll_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onscroll_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onseeked", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onseeked_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onseeked_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onseeking", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onseeking_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onseeking_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onselect", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselect_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselect_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onstalled", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onstalled_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onstalled_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onsubmit", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsubmit_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsubmit_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onsuspend", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsuspend_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onsuspend_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ontimeupdate", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontimeupdate_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontimeupdate_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ontoggle", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontoggle_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontoggle_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onvolumechange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onvolumechange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onvolumechange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onwaiting", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwaiting_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwaiting_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onwebkitanimationend", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationend_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationend_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onwebkitanimationiteration", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationiteration_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationiteration_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onwebkitanimationstart", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationstart_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkitanimationstart_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onwebkittransitionend", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkittransitionend_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwebkittransitionend_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onwheel", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwheel_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onwheel_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onauxclick", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onauxclick_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onauxclick_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ongotpointercapture", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ongotpointercapture_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ongotpointercapture_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onlostpointercapture", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onlostpointercapture_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onlostpointercapture_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerdown", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerdown_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerdown_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointermove", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointermove_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointermove_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerup", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerup_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerup_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointercancel", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointercancel_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointercancel_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerover", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerover_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerover_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerout", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerout_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerout_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerenter", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerenter_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerenter_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerleave", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerleave_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerleave_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onselectstart", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselectstart_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselectstart_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onselectionchange", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselectionchange_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onselectionchange_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onanimationend", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationend_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationend_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onanimationiteration", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationiteration_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationiteration_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onanimationstart", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationstart_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onanimationstart_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ontransitionrun", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionrun_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionrun_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ontransitionstart", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionstart_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionstart_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ontransitionend", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionend_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitionend_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "ontransitioncancel", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitioncancel_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","ontransitioncancel_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oncopy", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncopy_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncopy_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "oncut", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncut_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","oncut_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpaste", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpaste_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpaste_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "children", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","children_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "firstElementChild", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","firstElementChild_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "lastElementChild", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","lastElementChild_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "childElementCount", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","childElementCount_get",arguments,1)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "activeElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","activeElement_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "styleSheets", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","styleSheets_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "pointerLockElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","pointerLockElement_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "fullscreenElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreenElement_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fullscreenElement_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "adoptedStyleSheets", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","adoptedStyleSheets_get",arguments)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","adoptedStyleSheets_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "fonts", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fonts_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "adoptNode", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","adoptNode",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "append", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","append",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "captureEvents", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","captureEvents",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "caretRangeFromPoint", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","caretRangeFromPoint",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "clear", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","clear",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "close", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","close",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createAttribute", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createAttribute",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createAttributeNS", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createAttributeNS",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createCDATASection", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createCDATASection",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createComment", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createComment",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createDocumentFragment", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createDocumentFragment",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createElement", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createElement",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createElementNS", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createElementNS",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createEvent", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createEvent",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createExpression", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createExpression",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createNSResolver", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createNSResolver",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createNodeIterator", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createNodeIterator",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createProcessingInstruction", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createProcessingInstruction",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createRange", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createRange",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createTextNode", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createTextNode",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "createTreeWalker", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","createTreeWalker",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "elementFromPoint", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","elementFromPoint",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "elementsFromPoint", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","elementsFromPoint",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "evaluate", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","evaluate",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "execCommand", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","execCommand",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "exitFullscreen", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","exitFullscreen",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "exitPointerLock", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","exitPointerLock",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "getElementById", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementById",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "getElementsByClassName", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementsByClassName",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "getElementsByName", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementsByName",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "getElementsByTagName", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementsByTagName",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "getElementsByTagNameNS", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","getElementsByTagNameNS",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "getSelection", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","getSelection",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "hasFocus", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","hasFocus",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "importNode", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","importNode",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "open", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","open",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "prepend", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","prepend",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "queryCommandEnabled", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandEnabled",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "queryCommandIndeterm", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandIndeterm",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "queryCommandState", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandState",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "queryCommandSupported", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandSupported",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "queryCommandValue", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","queryCommandValue",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "querySelector", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","querySelector",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "querySelectorAll", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","querySelectorAll",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "releaseEvents", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","releaseEvents",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "replaceChildren", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","replaceChildren",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "webkitCancelFullScreen", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitCancelFullScreen",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "webkitExitFullscreen", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","webkitExitFullscreen",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "write", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","write",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "writeln", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","writeln",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "fragmentDirective", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","fragmentDirective_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "timeline", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","timeline_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "pictureInPictureEnabled", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","pictureInPictureEnabled_get",arguments,true)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "pictureInPictureElement", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","pictureInPictureElement_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Document.prototype, "onpointerrawupdate", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerrawupdate_get",arguments,null)},set:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","onpointerrawupdate_set",arguments)}});
xzvm.toolsFunc.defineProperty(Document.prototype, "exitPictureInPicture", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","exitPictureInPicture",arguments);}});
xzvm.toolsFunc.defineProperty(Document.prototype, "getAnimations", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Document.prototype,"Document","getAnimations",arguments);}});

//HTMLDocument对象
HTMLDocument = function HTMLDocument() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(HTMLDocument,"HTMLDocument");
Object.setPrototypeOf(HTMLDocument.prototype, Document.prototype);

//document对象
document = {}
Object.setPrototypeOf(document, HTMLDocument.prototype);
xzvm.toolsFunc.defineProperty(document, "location", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,document,"document","location_get",arguments)},set:function (){return xzvm.toolsFunc.dispatch(this,document,"document","location_set",arguments)}});
//Storage对象
Storage = function Storage() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(Storage,"Storage");
xzvm.toolsFunc.defineProperty(Storage.prototype, "length", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","length_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Storage.prototype, "clear", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","clear",arguments);}});
xzvm.toolsFunc.defineProperty(Storage.prototype, "getItem", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","getItem",arguments);}});
xzvm.toolsFunc.defineProperty(Storage.prototype, "key", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","key",arguments);}});
xzvm.toolsFunc.defineProperty(Storage.prototype, "removeItem", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","removeItem",arguments);}});
xzvm.toolsFunc.defineProperty(Storage.prototype, "setItem", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","setItem",arguments);}});
//localStorage对象
localStorage = {}
Object.setPrototypeOf(localStorage, Storage.prototype);
//Navigator对象
Navigator = function Navigator() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(Navigator,"Navigator");
xzvm.toolsFunc.defineProperty(Navigator.prototype, "vendorSub", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","vendorSub_get",arguments,"")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "productSub", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","productSub_get",arguments,"20030107")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "vendor", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","vendor_get",arguments,"Google Inc.")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "maxTouchPoints", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","maxTouchPoints_get",arguments,0)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "userActivation", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","userActivation_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "doNotTrack", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","doNotTrack_get",arguments,null)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "geolocation", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","geolocation_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "connection", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","connection_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "plugins", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","plugins_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "mimeTypes", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","mimeTypes_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "webkitTemporaryStorage", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","webkitTemporaryStorage_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "webkitPersistentStorage", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","webkitPersistentStorage_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "hardwareConcurrency", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","hardwareConcurrency_get",arguments,8)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "cookieEnabled", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","cookieEnabled_get",arguments,true)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "appCodeName", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","appCodeName_get",arguments,"Mozilla")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "appName", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","appName_get",arguments,"Netscape")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "appVersion", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","appVersion_get",arguments,"5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "platform", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","platform_get",arguments,"Linux x86_64")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "product", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","product_get",arguments,"Gecko")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "userAgent", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","userAgent_get",arguments,"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 UOS")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "language", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","language_get",arguments,"zh-CN")},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "languages", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","languages_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "onLine", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","onLine_get",arguments,true)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "webdriver", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","webdriver_get",arguments,false)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "getBattery", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","getBattery",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "getGamepads", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","getGamepads",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "javaEnabled", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","javaEnabled",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "sendBeacon", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","sendBeacon",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "vibrate", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","vibrate",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "scheduling", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","scheduling_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "clipboard", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","clipboard_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "credentials", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","credentials_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "keyboard", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","keyboard_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "managed", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","managed_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "mediaDevices", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","mediaDevices_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "storage", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","storage_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "serviceWorker", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","serviceWorker_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "wakeLock", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","wakeLock_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "deviceMemory", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","deviceMemory_get",arguments,8)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "hid", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","hid_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "locks", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","locks_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "mediaCapabilities", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","mediaCapabilities_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "mediaSession", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","mediaSession_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "permissions", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","permissions_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "presentation", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","presentation_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "serial", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","serial_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "usb", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","usb_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "xr", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","xr_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "userAgentData", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","userAgentData_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "clearAppBadge", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","clearAppBadge",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "setAppBadge", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","setAppBadge",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "getInstalledRelatedApps", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","getInstalledRelatedApps",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "getUserMedia", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","getUserMedia",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "requestMIDIAccess", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","requestMIDIAccess",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "requestMediaKeySystemAccess", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","requestMediaKeySystemAccess",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "webkitGetUserMedia", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","webkitGetUserMedia",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "registerProtocolHandler", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","registerProtocolHandler",arguments);}});
xzvm.toolsFunc.defineProperty(Navigator.prototype, "unregisterProtocolHandler", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Navigator.prototype,"Navigator","unregisterProtocolHandler",arguments);}});

//navigator对象
navigator = {}
Object.setPrototypeOf(navigator, Navigator.prototype);
//Location对象
Location = function Location() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(Location,"Location");

//location对象
location = {}
Object.setPrototypeOf(location, Location.prototype);
xzvm.toolsFunc.defineProperty(location, "valueOf", {enumerable: false, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","valueOf",arguments);}});
xzvm.toolsFunc.defineProperty(location, "ancestorOrigins", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","ancestorOrigins_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(location, "href", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","href_get",arguments,"https://www.baidu.com/s?&tn=79057844_3_dg&ie=utf-8&wd=mysql%E5%BA%95%E5%B1%82")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","href_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "origin", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","origin_get",arguments,"https://www.baidu.com")},set:undefined});
xzvm.toolsFunc.defineProperty(location, "protocol", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","protocol_get",arguments,"https:")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","protocol_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "host", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","host_get",arguments,"www.baidu.com")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","host_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "hostname", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","hostname_get",arguments,"www.baidu.com")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","hostname_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "port", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","port_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","port_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "pathname", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","pathname_get",arguments,"/s")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","pathname_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "search", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","search_get",arguments,"?&tn=79057844_3_dg&ie=utf-8&wd=mysql%E5%BA%95%E5%B1%82")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","search_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "hash", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,location,"location","hash_get",arguments,"")},set:function (){return xzvm.toolsFunc.dispatch(this,location,"location","hash_set",arguments)}});
xzvm.toolsFunc.defineProperty(location, "assign", {enumerable: true, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","assign",arguments);}});
xzvm.toolsFunc.defineProperty(location, "reload", {enumerable: true, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","reload",arguments);}});
xzvm.toolsFunc.defineProperty(location, "replace", {enumerable: true, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","replace",arguments);}});
xzvm.toolsFunc.defineProperty(location, "toString", {enumerable: true, configurable: false,writable: false,value:function (){return xzvm.toolsFunc.dispatch(this,location,"location","toString",arguments);}});

//window对象
//删除浏览器中不存在的对象
delete global;
delete Buffer;
delete WindowProperties;
window = globalThis;
Object.setPrototypeOf(window,Window.prototype);


//定义window中的方法
xzvm.toolsFunc.defineProperty(window,"atob",{
    value:function atob(str){
        return xzvm.toolsFunc.base64.base64decode(str);
    }
})

xzvm.toolsFunc.defineProperty(window,"btoa",{
    value:function btoa(str){
        return xzvm.toolsFunc.base64.base64encode(str);
    }
})

xzvm.toolsFunc.defineProperty(window, "name", {configurable:true, enumerable:true, get:function (){return xzvm.toolsFunc.dispatch(this, window, "window", "name_get", arguments, '')}, set:function (){return xzvm.toolsFunc.dispatch(this, window, "window", "name_set", arguments)}});

Object.defineProperty(window,"location",{configurable:false})
//全局变量
//代理对象
window = xzvm.toolsFunc.proxy(window,"window")
document = xzvm.toolsFunc.proxy(document,"document")
location = xzvm.toolsFunc.proxy(location,"location")
// 需要调试的代码
debugger;


!(function(_0x499145,_0x129c44){function _0x5e8408(_0x5af2bb,_0xe9c4c6,_0x24195e,_0x355044,_0x31c24d){return _0x5595(_0x355044-0x1cb,_0x24195e);}var _0x200725=_0x499145();function _0x57c075(_0x4511d9,_0x19aa02,_0x4d2b92,_0x4901cb,_0x8f76b2){return _0x5595(_0x4d2b92- -0xbb,_0x4901cb);}function _0x1f0bdd(_0x5b7e5c,_0x499281,_0x14e3fa,_0x4fa202,_0xb4c6d5){return _0x5595(_0x5b7e5c- -0x79,_0x14e3fa);}function _0x4f2dd1(_0x9ae254,_0x538260,_0x4c0e29,_0x187984,_0x58eed0){return _0x5595(_0x4c0e29-0x1d6,_0x9ae254);}function _0x28add5(_0xdbbc62,_0x1b7b4a,_0x433417,_0x54b72c,_0x448d7b){return _0x5595(_0x54b72c-0xe7,_0x1b7b4a);}while(!![]){try{var _0x44e87e=parseInt(_0x57c075(-0x26,-0x4c,0x27,'osc1',0x7c))/(-0x145e+0x219c+0x1*-0xd3d)*(parseInt(_0x57c075(0x6,-0x93,-0x3c,'jd5b',-0x53))/(-0x56*0x56+0x1e9d+-0x1*0x1b7))+-parseInt(_0x57c075(-0x66,0x72,0x4,'F@Wa',0x6c))/(0x626+-0x19f4*-0x1+-0x2017)*(-parseInt(_0x5e8408(0x35d,0x31f,'l2G8',0x2f5,0x2eb))/(0x1f22+0x5c5+0x13*-0x1f1))+parseInt(_0x4f2dd1('iDNV',0x31e,0x333,0x395,0x2f0))/(-0xe99+0x1d*0xe5+0xd*-0xdf)+parseInt(_0x28add5(0x1f9,'I5Hz',0x241,0x1fb,0x257))/(0x356+0x2*-0x51c+-0x374*-0x2)*(parseInt(_0x28add5(0x11f,'5nL3',0x1ab,0x16e,0x110))/(0x3*0xad+-0x5*0xe5+0x3*0xd3))+-parseInt(_0x5e8408(0x2f9,0x2a2,'XDs6',0x2d7,0x2af))/(-0x3*-0xcc1+0x1a14+-0x404f*0x1)+parseInt(_0x57c075(-0x4d,-0x85,-0x30,'osc1',0xb))/(0x23fc+0x1a9d+0x38*-0x11e)+-parseInt(_0x5e8408(0x358,0x2d3,'Upf%',0x312,0x34d))/(0x17c+-0x105*-0x25+0x25*-0x10f);if(_0x44e87e===_0x129c44)break;else _0x200725['push'](_0x200725['shift']());}catch(_0xc51be7){_0x200725['push'](_0x200725['shift']());}}}(_0x33af,-0x28*-0x3470+-0xb8d29+0xcb1*0xba),!(function(){function _0x292cd0(_0x188a93,_0xf57741,_0x3af290,_0x52f291,_0x29d11c){return _0x5595(_0xf57741-0x2fe,_0x188a93);}var _0x5aad28={'Tpfhr':function(_0x5b887f,_0x25dec4){return _0x5b887f(_0x25dec4);},'ydXrx':_0x292cd0('eEzp',0x40d,0x44c,0x3e3,0x3f8)+_0x2d051c(-0x1d7,-0x2ae,'Xdza',-0x241,-0x269),'gGsvH':function(_0x237f7a,_0x7a9cdc){return _0x237f7a===_0x7a9cdc;},'kxlUq':_0x180661(-0x1b,-0xb8,'#U#y',-0xb5,-0x61)+_0x180661(-0x19,-0xba,'eEzp',-0xc6,-0x6b)+'9f','qkKeS':_0x180661(0x1c,-0x22,'eEzp',0x41,-0x28)+_0x2d051c(-0x20a,-0x1c9,'W1Q1',-0x234,-0x268)+'4=','RPdqN':_0x2d051c(-0x14e,-0x1b2,'5nL3',-0x1ae,-0x145)+_0x180661(-0x8f,0x3d,'*S9z',-0x85,-0x1d)+'Bl','CDhGb':function(_0x239567,_0x32b0c3){return _0x239567==_0x32b0c3;},'xtwKH':_0x2d051c(-0x1dd,-0x19d,'[QWB',-0x209,-0x223)+_0x2d051c(-0x26d,-0x20e,'MUAu',-0x20d,-0x270),'gxlcY':_0x180661(-0xa7,-0x67,'oyYO',-0xb0,-0x40),'RWBUO':_0x565472(-0xb9,-0xa0,-0x71,-0xe4,'I5Hz'),'fTWDM':function(_0x51048f,_0x3702bc){return _0x51048f!==_0x3702bc;},'cyzZu':_0x565472(-0x10c,-0x130,-0x113,-0xc9,'6LF^'),'gmcXe':_0x180661(-0x2d,-0xb,'F@Wa',0x69,0x38),'TFOdI':_0x2d051c(-0x225,-0x16d,'Oq]1',-0x1ca,-0x225),'oIXzh':_0x565472(-0xb3,-0x91,-0x6f,-0xad,']u2q'),'BeDKP':function(_0x2c7ccf,_0x48dc79){return _0x2c7ccf===_0x48dc79;},'uDpSl':_0x26d6bb('W1Q1',-0xcf,-0xc5,-0x90,-0x11f),'JzLnD':_0x292cd0('jd5b',0x38b,0x319,0x3fa,0x39c),'NKawG':_0x565472(-0x134,-0x152,-0x152,-0xec,'Z#7R'),'TylVo':_0x2d051c(-0x240,-0x208,'eLE&',-0x254,-0x20a)+_0x292cd0('#U#y',0x377,0x322,0x38d,0x35d)+'+$','ALtos':function(_0x555a6a,_0x197631){return _0x555a6a==_0x197631;},'kmyWS':function(_0x32157c,_0x3d16cb){return _0x32157c(_0x3d16cb);},'lYywY':function(_0x2590fd,_0x5f3271,_0x1bf81e){return _0x2590fd(_0x5f3271,_0x1bf81e);},'KiMMJ':function(_0x16f107){return _0x16f107();},'JhePu':function(_0x30732c,_0x356613){return _0x30732c===_0x356613;},'cbhXA':_0x2d051c(-0x24f,-0x22b,'9[yf',-0x211,-0x1f4),'Qgymr':function(_0x5db7de,_0x322a3a){return _0x5db7de(_0x322a3a);},'zctVv':_0x180661(-0x69,0x2a,'nBgy',-0x56,-0x49)+_0x292cd0('TJeu',0x42a,0x460,0x464,0x423)+'Y=','WDnHx':function(_0x5e65a6,_0x160e7a){return _0x5e65a6===_0x160e7a;},'vaazE':_0x26d6bb('PP(U',-0x146,-0x1b3,-0xd2,-0x153)+_0x26d6bb('MUAu',-0xeb,-0xdd,-0xcf,-0x102)+_0x292cd0(')#TO',0x38d,0x3cc,0x3df,0x362)+_0x565472(-0xc6,-0x101,-0x101,-0xf7,'9[yf')+_0x292cd0('YpYO',0x455,0x46d,0x44e,0x449)+_0x292cd0('*S9z',0x439,0x45a,0x499,0x463)+_0x292cd0('Oq]1',0x3a7,0x3eb,0x41a,0x415)+_0x565472(-0xfb,-0xf6,-0xc9,-0x11a,'XDs6')+_0x2d051c(-0x1ce,-0x218,'p0Ua',-0x239,-0x1d8)+_0x292cd0('VFA0',0x3df,0x3c8,0x36e,0x413)+'==','BvNco':function(_0x4f47f4,_0x4f989a){return _0x4f47f4!==_0x4f989a;},'oBmAg':_0x180661(-0x45,0x4,'PP(U',-0x19,0xc),'jOUjG':_0x292cd0('VFA0',0x42d,0x486,0x452,0x470),'mfWPb':function(_0x454084,_0x56c20a){return _0x454084===_0x56c20a;},'jfqKy':function(_0x2cea1e,_0x15ecd4){return _0x2cea1e(_0x15ecd4);},'UGrMr':function(_0xd002ae,_0x1dbc4f){return _0xd002ae===_0x1dbc4f;},'xvxCC':_0x180661(-0x4a,0x37,'7QQq',-0x95,-0x29),'GkNto':_0x26d6bb('TJeu',-0x144,-0x176,-0x188,-0x10b),'MgXbU':function(_0x8011e2,_0x16b22f){return _0x8011e2===_0x16b22f;},'uIwot':_0x26d6bb('5nL3',-0x13c,-0xdc,-0xe8,-0xc7),'oNLQy':function(_0x58da57,_0x5d009a){return _0x58da57(_0x5d009a);},'EoKCJ':_0x292cd0('eVp8',0x406,0x3b6,0x3d6,0x439),'mDdyk':_0x26d6bb('#U#y',-0xde,-0xf6,-0x126,-0xc1),'AaxWv':function(_0xba5415,_0x17a94f){return _0xba5415(_0x17a94f);}};function _0x565472(_0x17aee8,_0x1701bf,_0x18c5d7,_0x25399d,_0x2a01dc){return _0x5595(_0x17aee8- -0x1ca,_0x2a01dc);}var _0x3dc722=(function(){function _0x4c1069(_0x3e44df,_0x3a4a60,_0x16509d,_0x38aa2b,_0x4fef42){return _0x180661(_0x3e44df-0x194,_0x3a4a60-0xbb,_0x3a4a60,_0x38aa2b-0x19e,_0x4fef42- -0x1d7);}function _0x5a0e23(_0x3d6699,_0x17537,_0x4c3b5f,_0x42341e,_0x4fb0e4){return _0x292cd0(_0x17537,_0x42341e- -0x1fe,_0x4c3b5f-0xc7,_0x42341e-0x150,_0x4fb0e4-0xc8);}var _0x4a0166={'MREfx':function(_0xadf9be,_0x5b5a41){function _0x2feaae(_0x441a60,_0x45fc61,_0x422df7,_0x40bf2e,_0x3cb097){return _0x5595(_0x441a60-0x61,_0x40bf2e);}return _0x5aad28[_0x2feaae(0xe1,0xfb,0x7b,'^y!y',0x133)](_0xadf9be,_0x5b5a41);},'lhkKP':_0x5aad28[_0x5b7dfe(-0xdf,-0x13c,-0x186,'l2G8',-0x17f)]};function _0x4a5cb2(_0x275d14,_0x59702f,_0xc377d6,_0x1a7533,_0x2d124f){return _0x292cd0(_0x275d14,_0x2d124f- -0x1ab,_0xc377d6-0x7b,_0x1a7533-0xe7,_0x2d124f-0x33);}function _0x5b7dfe(_0x5165c9,_0x4d2120,_0xf64981,_0x558c41,_0x3a080e){return _0x292cd0(_0x558c41,_0x4d2120- -0x538,_0xf64981-0xb6,_0x558c41-0x1da,_0x3a080e-0x182);}function _0x3aa916(_0x1a8e7f,_0x5c163b,_0x4fef61,_0xcc96e4,_0x133d25){return _0x292cd0(_0x1a8e7f,_0xcc96e4- -0x352,_0x4fef61-0xeb,_0xcc96e4-0xa9,_0x133d25-0x140);}if(_0x5aad28[_0x5b7dfe(-0x169,-0x190,-0x145,'I5Hz',-0x183)](_0x5aad28[_0x5b7dfe(-0xad,-0xed,-0x13d,'B63H',-0x9e)],_0x5aad28[_0x5b7dfe(-0x1bc,-0x1a5,-0x1ec,'W1Q1',-0x1e6)])){var _0x1192af=!![];return function(_0x488e32,_0x8f7fd4){function _0x5b019(_0x47d138,_0x1b6f57,_0x18aae7,_0x420dd1,_0x25fb06){return _0x5b7dfe(_0x47d138-0x9c,_0x1b6f57-0x3ee,_0x18aae7-0x1df,_0x47d138,_0x25fb06-0xff);}function _0x48e138(_0x3cdab8,_0x49fa9b,_0x5e29c0,_0x54a58d,_0xc06241){return _0x5b7dfe(_0x3cdab8-0x6d,_0x54a58d-0x538,_0x5e29c0-0x14f,_0x5e29c0,_0xc06241-0x83);}function _0x38be8f(_0x55df00,_0x38b755,_0x503637,_0x444407,_0xb2ca20){return _0x5b7dfe(_0x55df00-0x31,_0x38b755-0x38f,_0x503637-0xca,_0x55df00,_0xb2ca20-0x1e4);}function _0x32dceb(_0x52ef08,_0x3610a3,_0x170dd6,_0x4d9972,_0x5de02f){return _0x5a0e23(_0x52ef08-0x6d,_0x3610a3,_0x170dd6-0x104,_0x5de02f-0x2bd,_0x5de02f-0xb9);}var _0x202e51={'vKzla':function(_0x24244f,_0x538c40){function _0xb9e33f(_0x30b6a4,_0xff95e9,_0x5981a1,_0x1b0704,_0xc907bb){return _0x5595(_0xff95e9- -0x2a4,_0x1b0704);}return _0x5aad28[_0xb9e33f(-0x24e,-0x1dc,-0x185,'VnMB',-0x1f2)](_0x24244f,_0x538c40);},'GwIjF':_0x5aad28[_0x48e138(0x3e2,0x385,'[QWB',0x3d4,0x41b)],'KUVxd':function(_0x53699c,_0xefd52a){function _0x9fc22c(_0x2bcde6,_0x19b1db,_0x43c7c1,_0x11003e,_0x542dcb){return _0x48e138(_0x2bcde6-0x99,_0x19b1db-0x8,_0x542dcb,_0x43c7c1- -0x16f,_0x542dcb-0x22);}return _0x5aad28[_0x9fc22c(0x33c,0x2f3,0x2d8,0x28b,'XDs6')](_0x53699c,_0xefd52a);},'LhcFQ':_0x5aad28[_0x32dceb(0x3ee,'W1Q1',0x3ff,0x476,0x437)],'NfjzN':_0x5aad28[_0x30eaa5(0x424,'eLE&',0x3d4,0x3c2,0x3e4)],'IZwsz':_0x5aad28[_0x48e138(0x3fd,0x420,'bh[g',0x3ff,0x401)],'rMjhe':function(_0x1cc109,_0x1d82a3){function _0xd415dd(_0x24bb1b,_0xf7bc7,_0x203c53,_0x17329f,_0x51435d){return _0x5b019(_0xf7bc7,_0x24bb1b- -0x4a6,_0x203c53-0x4f,_0x17329f-0xad,_0x51435d-0x18b);}return _0x5aad28[_0xd415dd(-0x1b6,'*!b!',-0x15f,-0x1c5,-0x1ab)](_0x1cc109,_0x1d82a3);},'TMkgo':_0x5aad28[_0x32dceb(0x416,'F@Wa',0x486,0x44c,0x48a)],'yWeri':_0x5aad28[_0x38be8f('l2G8',0x2ab,0x2de,0x28b,0x282)],'LPPEy':function(_0x3f47f1,_0x349392){function _0x252bee(_0x1de2bf,_0x29bf6f,_0x4a754b,_0x1a4a6b,_0x2893e7){return _0x30eaa5(_0x1de2bf-0x134,_0x29bf6f,_0x4a754b-0x3b,_0x4a754b- -0x4a5,_0x2893e7-0xa);}return _0x5aad28[_0x252bee(-0xc4,'z]x8',-0x88,-0xed,-0xe9)](_0x3f47f1,_0x349392);},'TSYuW':_0x5aad28[_0x5b019('^yPc',0x26e,0x216,0x262,0x2a1)],'kJESK':function(_0x5f262,_0x504a2b){function _0x5b04dd(_0x5e8213,_0x47d030,_0x6c6d1c,_0x500ed6,_0x3be1c1){return _0x5b019(_0x5e8213,_0x6c6d1c-0x60,_0x6c6d1c-0xdd,_0x500ed6-0xcc,_0x3be1c1-0xc9);}return _0x5aad28[_0x5b04dd(')#TO',0x2d2,0x2d1,0x29f,0x31f)](_0x5f262,_0x504a2b);},'uBmKK':_0x5aad28[_0x5b019('U%M3',0x2d8,0x273,0x2b6,0x33a)],'fTpBm':_0x5aad28[_0x32dceb(0x49e,'*!b!',0x4a0,0x492,0x470)]};function _0x30eaa5(_0x42ae42,_0x179acc,_0x13afeb,_0x1e1e39,_0x394c33){return _0x4c1069(_0x42ae42-0x105,_0x179acc,_0x13afeb-0x8b,_0x1e1e39-0x1ea,_0x1e1e39-0x5c8);}if(_0x5aad28[_0x32dceb(0x4db,'PP(U',0x4bf,0x470,0x46f)](_0x5aad28[_0x32dceb(0x4d6,'W1Q1',0x487,0x459,0x4a5)],_0x5aad28[_0x48e138(0x449,0x3ce,'VScl',0x417,0x477)]))_0x4b232b[_0x48e138(0x440,0x435,'eEzp',0x44c,0x3eb)](_0x202e51[_0x48e138(0x3d9,0x436,'VnMB',0x44e,0x4c2)](_0x4d7963,_0x202e51[_0x38be8f('[QWB',0x243,0x299,0x29d,0x261)]));else{var _0x375e78=_0x1192af?function(){function _0x23be77(_0x4c790a,_0x405169,_0x22ab2e,_0x4940fd,_0x3ed2df){return _0x32dceb(_0x4c790a-0x63,_0x3ed2df,_0x22ab2e-0x97,_0x4940fd-0xd3,_0x22ab2e- -0x799);}function _0x3a1edd(_0x33b1e5,_0x57fa01,_0x18ea04,_0x57b514,_0x657371){return _0x48e138(_0x33b1e5-0xae,_0x57fa01-0x51,_0x57fa01,_0x57b514- -0x29d,_0x657371-0x111);}function _0x1da695(_0x5aa133,_0x30e84d,_0x459218,_0x4f401f,_0x5e0741){return _0x32dceb(_0x5aa133-0x130,_0x5e0741,_0x459218-0x13b,_0x4f401f-0x1b9,_0x5aa133- -0x2f9);}var _0xe9ab81={'wCloO':function(_0x505753,_0x22be90){function _0x63c308(_0x111119,_0x15339c,_0x3e74ad,_0x4fa591,_0x4cca08){return _0x5595(_0x15339c-0x175,_0x4cca08);}return _0x202e51[_0x63c308(0x246,0x28f,0x24e,0x238,'I5Hz')](_0x505753,_0x22be90);},'zKurV':function(_0x575a65,_0x38d69a){function _0x2f74a6(_0x196f57,_0x48ddd7,_0xffe112,_0x168e91,_0x4a8ea2){return _0x5595(_0x48ddd7- -0x1b9,_0x4a8ea2);}return _0x202e51[_0x2f74a6(-0x96,-0xca,-0xdb,-0xb7,'XGgH')](_0x575a65,_0x38d69a);},'AbTTt':_0x202e51[_0x5d8bb5(0x359,0x355,0x33b,0x336,'W(BC')],'ZZZbN':_0x202e51[_0x23be77(-0x2a2,-0x231,-0x298,-0x2e3,'VnMB')],'YETan':_0x202e51[_0x23be77(-0x24e,-0x22e,-0x29d,-0x246,'VFA0')],'xyQBI':function(_0x22ab11,_0x38b0c1){function _0x236d2c(_0x57e7fc,_0x4c2d32,_0x42c244,_0x10a77a,_0x36186e){return _0x3a1edd(_0x57e7fc-0x19d,_0x36186e,_0x42c244-0xce,_0x4c2d32- -0x352,_0x36186e-0x16b);}return _0x202e51[_0x236d2c(-0x1ac,-0x1bb,-0x193,-0x177,'Oq]1')](_0x22ab11,_0x38b0c1);},'ieRgr':_0x202e51[_0x3a1edd(0x16f,'eLE&',0x170,0x117,0x16a)],'fjQoW':_0x202e51[_0x23be77(-0x298,-0x2dc,-0x297,-0x222,'*!b!')],'gDbEY':function(_0x19245b,_0x20218d){function _0x5da2e2(_0x3c639e,_0x2c5d36,_0x4ab72c,_0x4a20ef,_0xba0b91){return _0x23be77(_0x3c639e-0x153,_0x2c5d36-0xbd,_0x4ab72c-0x417,_0x4a20ef-0xdc,_0xba0b91);}return _0x202e51[_0x5da2e2(0x13c,0xfd,0x116,0x135,'oyYO')](_0x19245b,_0x20218d);},'hSutQ':_0x202e51[_0x1da695(0x213,0x211,0x231,0x1bb,')#TO')]};function _0x56019e(_0xba292c,_0x5be1e3,_0x545311,_0x3f4e5f,_0x1937ae){return _0x38be8f(_0x1937ae,_0x5be1e3-0x5f,_0x545311-0x155,_0x3f4e5f-0x11d,_0x1937ae-0x68);}function _0x5d8bb5(_0x4a2ee1,_0x22b2e2,_0x50ba8a,_0x55b5df,_0x47c297){return _0x5b019(_0x47c297,_0x50ba8a-0x4a,_0x50ba8a-0xf8,_0x55b5df-0x15f,_0x47c297-0x1e2);}if(_0x202e51[_0x23be77(-0x36a,-0x37a,-0x309,-0x2af,'B63H')](_0x202e51[_0x23be77(-0x2d5,-0x2fb,-0x32d,-0x300,'nBgy')],_0x202e51[_0x5d8bb5(0x2a8,0x2c3,0x308,0x2aa,'7QQq')])){if(_0xe9ab81[_0x1da695(0x216,0x1f7,0x255,0x25a,'Z#7R')](_0x3b747e[_0xe9ab81[_0x1da695(0x1e3,0x1b3,0x1e5,0x1fc,'5nL3')](_0x355fd8,_0xe9ab81[_0x56019e(0x2e5,0x28d,0x2fa,0x246,'9pFz')])],_0x278765[_0xe9ab81[_0x1da695(0x150,0x175,0x165,0x1b9,'NvQJ')](_0x3120a7,_0xe9ab81[_0x3a1edd(0x10e,'MUAu',0x117,0x102,0x15c)])][_0xe9ab81[_0x5d8bb5(0x39a,0x394,0x33f,0x2e0,'U%M3')](_0x2ff126,_0xe9ab81[_0x3a1edd(0x14e,'p0Ua',0x178,0x125,0x149)])])){if(_0xe9ab81[_0x23be77(-0x300,-0x2bc,-0x2c1,-0x2a1,'eVp8')](_0x46042a[_0x1da695(0x21f,0x21a,0x22b,0x231,'nBgy')+_0x56019e(0x224,0x25a,0x207,0x226,'v53p')+_0x1da695(0x164,0x138,0xf0,0x175,'Z#7R')+_0x56019e(0x235,0x25c,0x21a,0x27d,'6LF^')+_0x23be77(-0x2a2,-0x237,-0x2a9,-0x2de,'*S9z')](_0x2b1eea,_0xe9ab81[_0x3a1edd(0x89,'Upf%',0x139,0xd7,0xcc)])[_0x23be77(-0x3a5,-0x308,-0x331,-0x366,'PP(U')+_0x3a1edd(0x1be,'VFA0',0x103,0x16f,0x186)+'le'],'')){_0x1dfe96[_0x56019e(0x2c9,0x2ac,0x2cd,0x2d9,'nBgy')](_0xe9ab81[_0x3a1edd(0x19b,')#TO',0x1c2,0x1a3,0x1e5)](_0x4cb7f7,_0xe9ab81[_0x1da695(0x1da,0x191,0x1d7,0x17c,'6LF^')]));return;}else{_0x10d54d[_0x3a1edd(0x9d,'W1Q1',0x97,0x104,0xfa)](_0xe9ab81[_0x56019e(0x228,0x247,0x20f,0x202,'*!b!')](_0x4b70a2,_0xe9ab81[_0x3a1edd(0x1d8,'XDs6',0x14f,0x173,0x12b)]));return;}}}else{if(_0x8f7fd4){if(_0x202e51[_0x3a1edd(0x1e4,'^yPc',0x145,0x1a1,0x191)](_0x202e51[_0x23be77(-0x2c1,-0x31d,-0x2b9,-0x276,'1XFK')],_0x202e51[_0x23be77(-0x2c9,-0x306,-0x2b9,-0x2e9,'1XFK')])){var _0x56fc66=_0x8f7fd4[_0x56019e(0x28c,0x2c9,0x277,0x2ae,'VFA0')](_0x488e32,arguments);return _0x8f7fd4=null,_0x56fc66;}else{var _0x2af2c2=_0x146c11[_0x1da695(0x20a,0x1b1,0x1ad,0x206,'7QQq')](_0x15d0ef,arguments);return _0x21b485=null,_0x2af2c2;}}}}:function(){};return _0x1192af=![],_0x375e78;}};}else{_0x582a5e[_0x5a0e23(0x265,'Z#7R',0x27f,0x210,0x1a7)](_0x4a0166[_0x5b7dfe(-0x1c6,-0x19f,-0x12f,'B63H',-0x1fe)](_0x414233,_0x4a0166[_0x4a5cb2('p0Ua',0x19d,0x21d,0x23b,0x1c6)]));return;}}());function _0x26d6bb(_0x4de21a,_0x8cd399,_0xbae320,_0xdefa05,_0x576e74){return _0x5595(_0x8cd399- -0x1d8,_0x4de21a);}function _0x2d051c(_0x54939c,_0x2073ae,_0x38285e,_0x2f75b6,_0x16b7d1){return _0x5595(_0x2f75b6- -0x302,_0x38285e);}var _0x225310=_0x5aad28[_0x292cd0('PP(U',0x387,0x37b,0x3db,0x37d)](_0x3dc722,this,function(){function _0x41b19a(_0x42c61a,_0xd411ec,_0x1ec76b,_0xd406de,_0x2991b3){return _0x565472(_0x1ec76b-0x509,_0xd411ec-0xa8,_0x1ec76b-0x1f4,_0xd406de-0x14f,_0x2991b3);}function _0x5b5005(_0x530ab1,_0x12a5de,_0x2339e0,_0x24f626,_0x1caeb0){return _0x292cd0(_0x530ab1,_0x24f626- -0x3cc,_0x2339e0-0x154,_0x24f626-0x126,_0x1caeb0-0x71);}function _0x45161e(_0xcf377b,_0x52fd2a,_0x9ce90b,_0x1d2ef6,_0x23d695){return _0x565472(_0x23d695- -0x4a,_0x52fd2a-0xc8,_0x9ce90b-0xaf,_0x1d2ef6-0x19d,_0xcf377b);}function _0x86f188(_0x3f4c69,_0x5869dd,_0x210617,_0x33e337,_0x356938){return _0x292cd0(_0x3f4c69,_0x5869dd- -0x33f,_0x210617-0x3,_0x33e337-0x78,_0x356938-0x82);}function _0x1f7ee1(_0x5b2317,_0x29af8a,_0x20ab7a,_0x5d0f46,_0x5d6a87){return _0x180661(_0x5b2317-0xf4,_0x29af8a-0x1ee,_0x5d6a87,_0x5d0f46-0x1e8,_0x29af8a- -0x103);}if(_0x5aad28[_0x41b19a(0x40c,0x421,0x405,0x406,'eLE&')](_0x5aad28[_0x86f188('PP(U',0x3c,0x23,0xb2,0x14)],_0x5aad28[_0x86f188('Z#7R',0x44,0x33,0xb9,0xa5)])){var _0x1a1a64=_0x2294e9?function(){function _0x40d279(_0x286091,_0xd4bd93,_0x2948a6,_0x8b70b9,_0x418a9b){return _0x1f7ee1(_0x286091-0x14b,_0xd4bd93-0x3a3,_0x2948a6-0x2a,_0x8b70b9-0xa8,_0x2948a6);}if(_0x414409){var _0x497bf3=_0x4eed22[_0x40d279(0x1c2,0x222,'l2G8',0x28c,0x229)](_0x3ce6a9,arguments);return _0x40cbbc=null,_0x497bf3;}}:function(){};return _0x3659fd=![],_0x1a1a64;}else return _0x225310[_0x5b5005('Upf%',0xf,-0x23,-0x59,-0xf)+_0x41b19a(0x416,0x45e,0x416,0x42b,'^yPc')]()[_0x45161e(')#TO',-0x1cf,-0x1e5,-0x1b1,-0x17a)+'h'](_0x5aad28[_0x1f7ee1(-0x1b0,-0x18a,-0x1ea,-0x1d4,']u2q')])[_0x5b5005('6LF^',0x85,0x68,0x34,0x84)+_0x5b5005('#U#y',0x34,0x1f,0x83,0xa4)]()[_0x86f188('oyYO',0xbb,0x98,0xed,0x95)+_0x86f188('YpYO',0xf1,0xcc,0x13e,0x9c)+'r'](_0x225310)[_0x1f7ee1(-0x15a,-0x11c,-0xc3,-0xa7,'iDNV')+'h'](_0x5aad28[_0x1f7ee1(-0x132,-0x172,-0x1bc,-0x14b,'9pFz')]);});_0x5aad28[_0x2d051c(-0x16d,-0x16c,'z]x8',-0x1a9,-0x180)](_0x225310);function _0x180661(_0x55100a,_0x5cd3fc,_0x5b2353,_0x2d81f4,_0x130352){return _0x5595(_0x130352- -0xf9,_0x5b2353);}try{x=atob,g=window,y=document[_0x2d051c(-0x234,-0x280,'ltXv',-0x27e,-0x23d)+_0x2d051c(-0x1af,-0x1bd,'I5Hz',-0x1d9,-0x219)];if(_0x5aad28[_0x26d6bb('z]x8',-0xaa,-0x54,-0xaa,-0x73)](window[_0x2d051c(-0x22e,-0x248,'[QWB',-0x209,-0x1b4)+_0x180661(-0x22,-0x3f,'VFA0',-0x65,0x12)],y)){if(_0x5aad28[_0x292cd0('9[yf',0x3c3,0x3b6,0x387,0x3b0)](Object[_0x292cd0('PP(U',0x448,0x426,0x40e,0x472)+_0x26d6bb('z]x8',-0xa8,-0xf7,-0xa7,-0x7f)+_0x26d6bb('*!b!',-0x90,-0x1b,-0x105,-0x49)+_0x180661(0x16,-0xc0,'oyYO',-0x3a,-0x5c)+_0x180661(0x15,-0x81,'^y!y',-0x16,-0x5b)](location,_0x5aad28[_0x565472(-0x123,-0x17e,-0xbb,-0xf8,'I5Hz')])[_0x2d051c(-0x281,-0x2c4,'eEzp',-0x28e,-0x23b)][_0x26d6bb('eEzp',-0xa3,-0x61,-0x116,-0xd8)],_0x5aad28[_0x180661(0x65,0x51,'W1Q1',-0x37,0x2e)](x,_0x5aad28[_0x565472(-0xd6,-0xd6,-0x100,-0x78,'U%M3')]))){if(_0x5aad28[_0x180661(-0x12,0x13,'Oq]1',-0x8c,-0x1a)](Object[_0x2d051c(-0x1e4,-0x164,'9pFz',-0x1da,-0x1a4)+_0x565472(-0xf8,-0x96,-0xdd,-0xd1,'MUAu')+_0x565472(-0x10e,-0xc8,-0x14e,-0xa3,'NvQJ')+_0x180661(-0x14,-0xb,'F@Wa',-0x49,-0x71)+_0x292cd0('bh[g',0x3fe,0x3b2,0x41f,0x46d)](location,_0x5aad28[_0x565472(-0xe6,-0x11a,-0x154,-0x114,'nBgy')])[_0x26d6bb('ltXv',-0x139,-0xfc,-0x18f,-0xc2)][_0x292cd0('ltXv',0x449,0x456,0x40f,0x43d)+_0x180661(-0x4e,0x9f,'TJeu',0x84,0x29)](),_0x5aad28[_0x180661(-0x12,-0x18,'7QQq',-0x28,-0x39)](x,_0x5aad28[_0x292cd0('VScl',0x3f5,0x3b1,0x381,0x3f0)]))){if(_0x5aad28[_0x180661(-0xb,0x5e,'^yPc',0x26,-0xd)](_0x5aad28[_0x180661(0x3c,-0x5a,'osc1',-0x58,0x2)],_0x5aad28[_0x565472(-0xe7,-0xb0,-0x112,-0x145,'6LF^')])){if(_0x5aad28[_0x2d051c(-0x281,-0x1bb,'9pFz',-0x210,-0x1de)](y[_0x5aad28[_0x2d051c(-0x1d9,-0x205,'Upf%',-0x1a6,-0x180)](x,_0x5aad28[_0x26d6bb('Z#7R',-0x167,-0x19d,-0x1d0,-0x1b9)])],g[_0x5aad28[_0x180661(-0x94,-0x72,'NvQJ',-0xc5,-0x76)](x,_0x5aad28[_0x292cd0('eEzp',0x397,0x349,0x389,0x386)])][_0x5aad28[_0x565472(-0x70,-0xc2,-0x64,-0x96,'z]x8')](x,_0x5aad28[_0x565472(-0xc9,-0xac,-0xd5,-0x137,'bh[g')])])){if(_0x5aad28[_0x292cd0('6LF^',0x3c9,0x361,0x423,0x36e)](_0x5aad28[_0x565472(-0x149,-0x16b,-0x186,-0x189,'YpYO')],_0x5aad28[_0x565472(-0x91,-0xcc,-0x99,-0x28,'v53p')])){_0x309b47[_0x2d051c(-0x1ff,-0x204,'^yPc',-0x272,-0x21a)](_0x5aad28[_0x26d6bb('YpYO',-0xfb,-0x10f,-0x8b,-0xa5)](_0x5ddc0c,_0x5aad28[_0x26d6bb('5nL3',-0x10c,-0x156,-0xfc,-0x113)]));return;}else{if(_0x5aad28[_0x180661(-0x90,0x28,')#TO',-0x8a,-0x4c)](Object[_0x292cd0('Oq]1',0x3e9,0x375,0x3cb,0x3d9)+_0x26d6bb(']u2q',-0xab,-0xa2,-0x38,-0xb3)+_0x2d051c(-0x26d,-0x1bb,'TJeu',-0x1ff,-0x197)+_0x565472(-0x139,-0xe2,-0xf4,-0x101,'*!b!')+_0x2d051c(-0x232,-0x2ea,'Z#7R',-0x280,-0x20f)](g,_0x5aad28[_0x26d6bb('oyYO',-0xef,-0x13b,-0x15d,-0xe6)])[_0x2d051c(-0x1f6,-0x1c5,'ltXv',-0x218,-0x1f7)+_0x180661(-0x5d,-0x3f,'NvQJ',-0xd,0x6)+'le'],'')){if(_0x5aad28[_0x565472(-0xf2,-0x109,-0x14e,-0xae,'Oq]1')](_0x5aad28[_0x292cd0(')#TO',0x429,0x3b3,0x424,0x400)],_0x5aad28[_0x180661(-0x8d,-0x5a,'1XFK',-0x73,-0x7b)])){console[_0x565472(-0xa4,-0xd5,-0x94,-0xd7,')#TO')](_0x5aad28[_0x2d051c(-0x22e,-0x1f5,'YpYO',-0x24d,-0x25a)](x,_0x5aad28[_0x26d6bb('Xdza',-0xf3,-0xf1,-0xe9,-0xeb)]));return;}else{if(_0xf628dd){var _0x161baa=_0x1b3f94[_0x565472(-0x14f,-0x1b6,-0x15b,-0x109,'l2G8')](_0x31595a,arguments);return _0x507c60=null,_0x161baa;}}}else{if(_0x5aad28[_0x565472(-0xec,-0x8e,-0x133,-0xfb,'l2G8')](_0x5aad28[_0x26d6bb('Xdza',-0xf1,-0xf2,-0xc8,-0xf6)],_0x5aad28[_0x26d6bb('ltXv',-0xc0,-0xa0,-0x113,-0xaa)])){console[_0x180661(0x72,0x88,'9pFz',0x57,0x5c)](_0x5aad28[_0x180661(0x55,0x3f,'VFA0',0x3f,0x14)](x,_0x5aad28[_0x292cd0('XGgH',0x3d3,0x360,0x372,0x438)]));return;}else return _0x361f64[_0x565472(-0xa9,-0xb5,-0xd5,-0xd9,')#TO')+_0x565472(-0x90,-0x87,-0xf6,-0x101,'eEzp')]()[_0x292cd0('NvQJ',0x3e4,0x42a,0x38d,0x3c5)+'h'](TMqQLm[_0x292cd0('v53p',0x43c,0x445,0x3e8,0x3f7)])[_0x2d051c(-0x1f8,-0x1bb,'W1Q1',-0x1e2,-0x219)+_0x565472(-0x7e,-0xa3,-0xcd,-0xdc,'W1Q1')]()[_0x565472(-0x144,-0xda,-0xd1,-0x197,'eVp8')+_0x180661(-0x5a,0x36,'XDs6',0x51,-0x9)+'r'](_0x504c82)[_0x180661(-0x61,-0x6f,'PP(U',0x2a,-0x36)+'h'](TMqQLm[_0x565472(-0x116,-0x9f,-0x10b,-0xb5,'bh[g')]);}}}}else{if(_0x5aad28[_0x565472(-0x112,-0x13d,-0xf2,-0x165,'Xdza')](_0x36f127[_0x292cd0('MUAu',0x3b5,0x411,0x3ff,0x390)+_0x2d051c(-0x1ef,-0x242,'eVp8',-0x25d,-0x215)+_0x26d6bb('XGgH',-0xbc,-0x7a,-0x77,-0x122)+_0x26d6bb('Z#7R',-0xba,-0xf5,-0xde,-0xb7)+_0x2d051c(-0x1df,-0x258,'VScl',-0x20c,-0x22e)](_0x2bbded,_0x5aad28[_0x180661(-0x6f,-0x25,'osc1',-0x86,-0x81)])[_0x565472(-0x14e,-0x152,-0x118,-0x175,'[QWB')+_0x565472(-0x108,-0xb3,-0x16a,-0x157,'A&%9')+'le'],'')){_0x5caa71[_0x292cd0('NvQJ',0x41b,0x464,0x3bb,0x3fd)](_0x5aad28[_0x565472(-0x77,-0x52,-0x38,-0x25,'PP(U')](_0x73a993,_0x5aad28[_0x292cd0('Xdza',0x3e3,0x419,0x439,0x36d)]));return;}else{_0x3350c1[_0x2d051c(-0x23d,-0x1be,'W(BC',-0x22e,-0x1bd)](_0x5aad28[_0x2d051c(-0x269,-0x26a,'5nL3',-0x20f,-0x27f)](_0x13c8d6,_0x5aad28[_0x180661(0x22,0x1d,'oyYO',0x47,0x1a)]));return;}}}}}console[_0x565472(-0x119,-0x147,-0x10c,-0xbb,'U%M3')](_0x5aad28[_0x2d051c(-0x230,-0x19e,'VScl',-0x205,-0x244)](x,_0x5aad28[_0x180661(-0x10,-0x95,'9pFz',0xf,-0x1f)]));}catch(_0x3676f6){console[_0x2d051c(-0x1ac,-0x232,'iDNV',-0x1bf,-0x1e0)](_0x5aad28[_0x565472(-0xc3,-0x10b,-0x52,-0xf2,'U%M3')](x,_0x5aad28[_0x565472(-0x153,-0xfd,-0x12b,-0x148,'5nL3')]));}}()));function _0x5595(_0x3905c6,_0x394707){var _0x5211b0=_0x33af();return _0x5595=function(_0x141b0d,_0x31d492){_0x141b0d=_0x141b0d-(-0x378+0x134*-0x13+0x3d3*0x7);var _0x430a0e=_0x5211b0[_0x141b0d];if(_0x5595['XuOtCv']===undefined){var _0x1391e5=function(_0x15f9a1){var _0x29a6f5='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var _0x135647='',_0x34c62a='',_0x2937d0=_0x135647+_0x1391e5;for(var _0x3507dd=0x102+0x433+-0x535,_0x1584ab,_0x1ae234,_0x49cf30=0x6ab*0x2+0x18dd+-0x2633;_0x1ae234=_0x15f9a1['charAt'](_0x49cf30++);~_0x1ae234&&(_0x1584ab=_0x3507dd%(0x6f1*-0x4+0x1*-0xabd+0x13*0x207)?_0x1584ab*(0x24a*0x4+0x7*0x37f+-0x2161)+_0x1ae234:_0x1ae234,_0x3507dd++%(-0x38*0x67+-0x112*-0x1f+0x2*-0x551))?_0x135647+=_0x2937d0['charCodeAt'](_0x49cf30+(0x41f*0x6+-0x10bf+-0x1*0x7f1))-(-0x1004+-0x1657+-0x2665*-0x1)!==-0x2*-0x135b+-0x96*-0x9+-0x2bfc?String['fromCharCode'](-0x18b*-0xc+0xacf*-0x1+-0x6b6&_0x1584ab>>(-(-0x2407+0x1*0x4a9+0x1f6*0x10)*_0x3507dd&-0x3cd*0x2+-0x2*-0x790+-0x40*0x1e)):_0x3507dd:-0x25a+-0xd5*-0x7+-0x379*0x1){_0x1ae234=_0x29a6f5['indexOf'](_0x1ae234);}for(var _0x363c83=0x1c92+-0x21d0+0x53e,_0x7bcdde=_0x135647['length'];_0x363c83<_0x7bcdde;_0x363c83++){_0x34c62a+='%'+('00'+_0x135647['charCodeAt'](_0x363c83)['toString'](0x5f1+0x6*-0x8a+-0x2a5*0x1))['slice'](-(-0x2126+0x2f9+-0x1e2f*-0x1));}return decodeURIComponent(_0x34c62a);};var _0x21fc01=function(_0x2f42e7,_0x439c5b){var _0x2506a7=[],_0x1f964a=0x25d4+0x13*0x4b+-0x2b65,_0x5770b0,_0xef73e1='';_0x2f42e7=_0x1391e5(_0x2f42e7);var _0x588ba2;for(_0x588ba2=0x11*0xe2+0x167d+0x1d*-0x14b;_0x588ba2<0x24d9+0xde2*-0x1+-0x1*0x15f7;_0x588ba2++){_0x2506a7[_0x588ba2]=_0x588ba2;}for(_0x588ba2=-0x18ef+0x8a5*0x3+-0x100;_0x588ba2<0x1c41*0x1+-0xa09*0x3+0x2da;_0x588ba2++){_0x1f964a=(_0x1f964a+_0x2506a7[_0x588ba2]+_0x439c5b['charCodeAt'](_0x588ba2%_0x439c5b['length']))%(-0xee9+0x135*0x5+0x9e0),_0x5770b0=_0x2506a7[_0x588ba2],_0x2506a7[_0x588ba2]=_0x2506a7[_0x1f964a],_0x2506a7[_0x1f964a]=_0x5770b0;}_0x588ba2=-0xe79+0x188b*0x1+0x509*-0x2,_0x1f964a=-0x1541+-0x186a+0x2dab;for(var _0x30921a=-0x5*-0x4f8+-0xfb*0x1b+0x1a1;_0x30921a<_0x2f42e7['length'];_0x30921a++){_0x588ba2=(_0x588ba2+(-0x20f1*-0x1+0xbe9+0x2b*-0x10b))%(0x1*-0xd3b+-0x2028+0x271*0x13),_0x1f964a=(_0x1f964a+_0x2506a7[_0x588ba2])%(-0x6be*-0x1+-0x1854+0x1296),_0x5770b0=_0x2506a7[_0x588ba2],_0x2506a7[_0x588ba2]=_0x2506a7[_0x1f964a],_0x2506a7[_0x1f964a]=_0x5770b0,_0xef73e1+=String['fromCharCode'](_0x2f42e7['charCodeAt'](_0x30921a)^_0x2506a7[(_0x2506a7[_0x588ba2]+_0x2506a7[_0x1f964a])%(-0x2*0x62b+-0x205f+0x2db5)]);}return _0xef73e1;};_0x5595['LcqJIY']=_0x21fc01,_0x3905c6=arguments,_0x5595['XuOtCv']=!![];}var _0x577616=_0x5211b0[-0x2050+0x68d*0x5+0x1*-0x71],_0x526c69=_0x141b0d+_0x577616,_0x37738c=_0x3905c6[_0x526c69];if(!_0x37738c){if(_0x5595['ynRMxg']===undefined){var _0x219dc7=function(_0x52a7c2){this['oJjoUW']=_0x52a7c2,this['RfXjUA']=[-0x1*0x159b+-0x3*-0xa27+-0x2f3*0x3,0xa4*-0x2f+-0x44*0x13+0x2328,-0x11f5+-0x2615+-0x12*-0x31d],this['FUtoZg']=function(){return'newState';},this['COsbbK']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['yrskzD']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x219dc7['prototype']['HgNqwL']=function(){var _0x534dbe=new RegExp(this['COsbbK']+this['yrskzD']),_0x24380d=_0x534dbe['test'](this['FUtoZg']['toString']())?--this['RfXjUA'][0x223b+-0x17a+-0x20c0*0x1]:--this['RfXjUA'][0x1*0x164+-0x1a80+0xc8e*0x2];return this['fvyuLU'](_0x24380d);},_0x219dc7['prototype']['fvyuLU']=function(_0x18a6e7){if(!Boolean(~_0x18a6e7))return _0x18a6e7;return this['JMjocq'](this['oJjoUW']);},_0x219dc7['prototype']['JMjocq']=function(_0x1f366a){for(var _0x301ef4=0x1a6f+-0x1*-0xec+-0x1b5b,_0x3e6112=this['RfXjUA']['length'];_0x301ef4<_0x3e6112;_0x301ef4++){this['RfXjUA']['push'](Math['round'](Math['random']())),_0x3e6112=this['RfXjUA']['length'];}return _0x1f366a(this['RfXjUA'][0x1*-0x26d1+-0xec0+-0x7a7*-0x7]);},new _0x219dc7(_0x5595)['HgNqwL'](),_0x5595['ynRMxg']=!![];}_0x430a0e=_0x5595['LcqJIY'](_0x430a0e,_0x31d492),_0x3905c6[_0x526c69]=_0x430a0e;}else _0x430a0e=_0x37738c;return _0x430a0e;},_0x5595(_0x3905c6,_0x394707);}function _0x33af(){var _0x55aae9=['jxhcTL1f','W7PdWOfRAW','W4hcRSot','fCkDiun0','cmkxifb0','sCobnKNcOa','lCoYWRldUaW','WO0qW4FcICo0','juLFBSk2','FZPtWRZcHW','rx94mCkz','ssmhBJi','nCkDmSkMWQ0','qJldR8o8uupcRG','eeKEBM8','qX3cM8oiWOC','db1hW74','WOhdGSkeFNa','W5lcIqldSSk4','mIjjW7VdSa','W4NdO8oNW5mH','b8ombhJcKSoxW6a','WQJdTCoEW6BcTW','BWaYDY8','EefuWRJdKW','zmk3W7xcI3XtWQlcUCk8W64DW77dLa','WQ/dUCkxzfq','nc3dQ8ozuW','W4VdSSkxW4eE','WQZdRs9wjq','WPe6W7u','d8kznSksW54','wtCDDs8','dCkUn8kLW64','W6tcP2VdQ1m','o3vdAmkR','kaHrW4/dVq','nXKnWQZdJSoPWPq','W7WkW5FdLCk+','W5FcOmoSW4z8','W6VdRXqwea','qmoUW4LxW7G','rmo/px7cSG','W7XcW6CuW5W','ne0xDa','W5NcGXu','grTCW7xdSW','W7JdVCoVt8kB','g8oWW43dOIxcKxen','iL5u','W4bCofSdE090W5udC8kNyG','W4tdNmo7W48L','W4jQvxaj','DZPmpv8','ybGBWQ3dRq','DCovW7bVWOq','vJ1GlK4','ydyLzH8','WP0kecLjWQS5cI7cP8ksWQ8','W5VdJH0Jeq','WOvCW5LWWOS','W45JpSkfra','W6etbCo+rG','q8kydq','zb44DJ4','dCkhnSk4W5i','WQyxBdTu','vcxcR8oAWR0','W7K5WPO5W48','W4xdGSobySkI','j8ksWQGHWPS','W7SdW7DB','WQ8cW5bmtG','W4RcIhZdTKxdK8oyACkVbeVdOse','WRddGmkwB0y','W77dNIiGpG','FY03WRhdLW','W7ZcTSkkWQldRMbhW4uqW7hdMd0','xCkjW7FdMmos','vCkxW6e','tLSAfCof','CdWQCHu','W49UWR5bvq','w21DWO1/','W68rWRuvW7a','aCkuxGpdOmkfWOVcHqCIewBcIW','W5Doq8oAWRm','W48zW5nlyq','W5WFWRO7W7m','ucWkWPldTG','v8oDaLJcGq','WRxdSSokW5/cLG','fMndwCo1','WRrZW7WvWQO','xmkYW7/dTmou','W7lcJmkEW4L2','W4ZdT8ohqSkL','zSo2W4LIW4S','W4D0Aq','rxKfqKS','x3rojCki','WPq7W7u','tmohW7fvWOm','BvPSWRRdIa','vvXGWPZdHa','W5vHW5qJW4W','BCo7WPZdGa0','BXVcHCoJWRy','Eb50WPtcSW','vSoKW4D/WQ4','W71BWOFdKmoU','WQ/cIcRcOcy','zSkXW7xcGxjuW6hcICkGW403W5S','BYqTWRxdGW','W5Hdo8kwtG','aCkMWRaTWRe','WQBdL8kdzge','i8kXWPCnWQi','gND8x8ko','W6ffW7mTW70','W53cIq/dTCkL','zSofW514WQe','WR8JW5X6BG','WPhdTCoft8oN','ywDFpCk2','ywu9E2u','WRzIW7i0WQi','ExDDWRS','qv5VWR7dNG','w8oif2ZcIW','vCkuhK8M','W4VdImoB','W6aUWQqR','W6y7WQOJeG','W5Dona','sN91nSke','W4LEWRJdKmki','oSoeWQJdSIm','W7PEW6OvW4e','W5e7WRmoiq','tb1HWOxcSq','WRldH8kqD2a','WOiABX8','WQa+zbX1','CqqRWQVdTG','W5BcSNNdPum','iuX/WRvZ','BdGOCdm','W4TMWQmSmXnMyCkcbbabW7i','rCkrg1iP','W5JdQCoEW443','iLTeq8k1','Fmk7W7ZdU8oR','WPddLYm','W7aKWQr1W73dNSoDmLyZW7FcKIC','WQJdNZtcQWu','WP7dJt/cPXu','W7ZcK8oTW5Pn','eazp','DMOCwa','WQXeW6q0WPW','W4TMW4yZW7O','j2GvvsWpmK7dKc1cfmoa','WPJdId3cQG4','yWePWRddKW','iMFcQ1Pb','W5pcOGxdQSkN','W78tWPmJpW','xW1YhxO','W5ldTCoyW6iC','CLWZBKa','WRNdNCkf','grPlW77dNG','sSoUg0NcJG','oL5Gt8k1','W6ZdPsyqaq','W5RcRMO','jSkanCklWRq','tmkoeemL','W7xdH8oPDeS','W7tdPri','h1zkvSk1','s11mWQhdIW','FtDk','l3HcWPFcJMldQ8oQ','W63dGWilbW','W7tcQhtdHLa','h1JcQgrA','W6pdKSolv2K','WPFdRZFcRWu','W4/dP8o9C0K','WPtdT8omW5BcIa','sr7cGmo/WQS','wSk2W4pdLW','WPhcOSonW6bLW6W3','W4JcQSokW4y','C8oTW4nFWRm','oCkpWRKeWRbCtW91qmorrHm','ECorW6XtWPq','W6TrAwSw','W4/cPCoa','ECkaWPVdRbm','kCkUpCkNW5u','W6DZBxD6','W7Hds0Kw','WRddOJRcTq0','WRyaW4rHzq','vCk8h2Sg','W6ldGqawjq','W6jrWOe','W41yt8oiWO8','e8k9mmksW54','AmkjW6hdNmoz','v8obqWi0b8o9D8k5W4FcQ2TY','d8kyiCkzW7m','WQnqW6i2WOu','zdW/tWe','W4RcItldP8k+','j19u','Emo4W7XIW6W','W4RcPmoa','W4ZdMsWrja','W7v1x8oEWQa','W41vWOK','cYPeW6pdUa','vYKTAaq','u8oTje3cVa','qfDF','EtjpWRpcPW','ytZcUSoKWO8','WO3dKvhcOCo6WPLdeMlcUZDg','W6RdNSocuxm','W4RdMSo2s2O','W5Xej8kbEa','c8kua3X/','WRWmW57cLmk1WRVcQa9BoCkfFuG','fXfeW5NdHG'];_0x33af=function(){return _0x55aae9;};return _0x33af();}
