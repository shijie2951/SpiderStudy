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
// 插件功能相关
!function (){

    // hook 插件
    xzvm.toolsFunc.hook = function hook(func, funcInfo, isDebug, onEnter, onLeave, isExec){
        // func ： 原函数，需要hook的函数
        // funcInfo: 是一个对象，objName，funcName属性
        // isDebug: 布尔类型, 是否进行调试，关键点定位，回溯调用栈
        // onEnter：函数， 原函数执行前执行的函数，改原函数入参，或者输出入参
        // onLeave： 函数，原函数执行完之后执行的函数，改原函数的返回值，或者输出原函数的返回值
        // isExec ： 布尔， 是否执行原函数，比如无限debuuger函数
        if(typeof func !== 'function'){
            return func;
        }
        if(funcInfo === undefined){
            funcInfo = {};
            funcInfo.objName = "globalThis";
            funcInfo.funcName = func.name || '';
        }
        if(isDebug === undefined){
            isDebug = false;
        }
        if(!onEnter){
            onEnter = function (obj){
                console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}]正在调用，参数是${JSON.stringify(obj.args)}}`);
            }
        }
        if(!onLeave){
            onLeave = function (obj){
                console.log(`{hook|${funcInfo.objName}[${funcInfo.funcName}]正在调用，返回值是[${obj.result}}]`);
            }
        }
        if(isExec === undefined){
            isExec = true;
        }
        // 替换的函数
        let hookFunc = function (){
            if(isDebug){
                debugger;
            }
            let obj = {};
            obj.args = [];
            for (let i=0;i<arguments.length;i++){
                obj.args[i] = arguments[i];
            }
            // 原函数执行前
            onEnter.call(this, obj); // onEnter(obj);
            // 原函数正在执行
            let result;
            if(isExec){
                result = func.apply(this, obj.args);
            }
            obj.result = result;
            // 原函数执行后
            onLeave.call(this, obj); // onLeave(obj);
            // 返回结果
            return obj.result;
        }
        // hook 后的函数进行native
        xzvm.toolsFunc.setNative(hookFunc, funcInfo.funcName);
        xzvm.toolsFunc.reNameFunc(hookFunc, funcInfo.funcName);
        return hookFunc;
    }
    // hook 对象的属性，本质是替换属性描述符
    xzvm.toolsFunc.hookObj = function hookObj(obj, objName, propName, isDebug){
        // obj :需要hook的对象
        // objName: hook对象的名字
        // propName： 需要hook的对象属性名
        // isDubug: 是否需要debugger
        let oldDescriptor = Object.getOwnPropertyDescriptor(obj, propName);
        let newDescriptor = {};
        if(!oldDescriptor.configurable){ // 如果是不可配置的，直接返回
            return;
        }
        // 必须有的属性描述
        newDescriptor.configurable = true;
        newDescriptor.enumerable = oldDescriptor.enumerable;
        if(oldDescriptor.hasOwnProperty("writable")){
            newDescriptor.writable = oldDescriptor.writable;
        }
        if(oldDescriptor.hasOwnProperty("value")){
            let value = oldDescriptor.value;
            if(typeof value !== "function"){
                return;
            }
            let funcInfo = {
                "objName": objName,
                "funcName": propName
            }
            newDescriptor.value = xzvm.toolsFunc.hook(value,funcInfo ,isDebug);
        }
        if(oldDescriptor.hasOwnProperty("get")){
            let get = oldDescriptor.get;
            let funcInfo = {
                "objName": objName,
                "funcName": `get ${propName}`
            }
            newDescriptor.get = xzvm.toolsFunc.hook(get,funcInfo ,isDebug);
        }
        if(oldDescriptor.hasOwnProperty("set")){
            let set = oldDescriptor.set;
            let funcInfo = {
                "objName": objName,
                "funcName": `set ${propName}`
            }
            newDescriptor.set = xzvm.toolsFunc.hook(set,funcInfo ,isDebug);
        }
        Object.defineProperty(obj, propName, newDescriptor);
    }
    // hook 原型对象的所有属性
    xzvm.toolsFunc.hookProto = function hookProto(proto, isDebug){
        // proto :函数原型
        // isDebug: 是否debugger
        let protoObj = proto.prototype;
        let name = proto.name;
        for(const prop in Object.getOwnPropertyDescriptors(protoObj)){
            xzvm.toolsFunc.hookObj(protoObj, `${name}.prototype`, prop, isDebug);
        }
        console.log(`hook ${name}.prototype`);
    }
    // 获取对象类型
    xzvm.toolsFunc.getType = function getType(obj){
        return Object.prototype.toString.call(obj);
    }
    // proxy代理器
    xzvm.toolsFunc.proxy = function proxy(obj, objName){
    // obj: 原始对象
    // objName: 原始对象的名字
    if(!xzvm.config.proxy){
        return obj;
    }
    let handler = {
        get:function (target,prop,receiver){// 三个参数
            let result;
            try {//防止报错
                result = Reflect.get(target,prop,receiver);
                let type = xzvm.toolsFunc.getType(result);
                if(result instanceof Object){
                    console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],type:[${type}]}`);
                    // 递归代理
                    result = xzvm.toolsFunc.proxy(result, `${objName}.${prop.toString()}`);
                }else if(typeof result === "symbol"){
                    console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result.toString()}]}`);
                }else{
                    console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],ret:[${result}]}`);
                }

            }catch (e) {
                console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`);
            }
            return result;
        },
        set:function (target,prop,value,receiver){
            let result;
            try{
                result = Reflect.set(target,prop,value,receiver);
                let type = xzvm.toolsFunc.getType(value);
                if(value instanceof Object){
                    console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],type:[${type}]}`);
                }else if(typeof value === "symbol"){
                    console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],value:[${value.toString()}]}`);
                }else{
                    console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],value:[${value}]}`);
                }
            }catch (e){
                console.log(`{set|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`);
            }
            return result;
        },
        getOwnPropertyDescriptor:function (target, prop){
            let result;// undefined, 描述符对象
            try{
                result = Reflect.getOwnPropertyDescriptor(target, prop);
                let type = xzvm.toolsFunc.getType(result);
                console.log(`{getOwnPropertyDescriptor|obj:[${objName}] -> prop:[${prop.toString()}],type:[${type}]}`);
                // if(typeof result !== "undefined"){
                //     result = xzvm.toolsFunc.proxy(result, `${objName}.${prop.toString()}.PropertyDescriptor`);
                // }
            }catch (e){
                 console.log(`{getOwnPropertyDescriptor|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`);
            }
            return result;
        },
        defineProperty: function (target, prop, descriptor){
            let result;
            try{
                result = Reflect.defineProperty(target, prop, descriptor);
                console.log(`{defineProperty|obj:[${objName}] -> prop:[${prop.toString()}]}`);
            }catch (e) {
                console.log(`{defineProperty|obj:[${objName}] -> prop:[${prop.toString()}],error:[${e.message}]}`);
            }
            return result;
        },
        apply:function (target, thisArg, argumentsList){
            // target: 函数对象
            // thisArg: 调用函数的this指针
            // argumentsList: 数组， 函数的入参组成的一个列表
            let result;
            try{
                result = Reflect.apply(target, thisArg, argumentsList);
                let type = xzvm.toolsFunc.getType(result);
                if(result instanceof Object){
                    console.log(`{apply|function:[${objName}], type:[${type}]}`);
                }else if(typeof result === "symbol"){
                    console.log(`{apply|function:[${objName}], result:[${result.toString()}]}`);
                }else{
                    console.log(`{apply|function:[${objName}], result:[${result}]}`);
                }
            }catch (e) {
                console.log(`{apply|function:[${objName}],error:[${e.message}]}`);
            }
            return result;
        },
        construct:function (target, argArray, newTarget) {
            // target: 函数对象
            // argArray： 参数列表
            // newTarget：代理对象
            let result;
            try{
                result = Reflect.construct(target, argArray, newTarget);
                let type = xzvm.toolsFunc.getType(result);
                console.log(`{construct|function:[${objName}], type:[${type}]}`);
            }catch (e) {
                console.log(`{construct|function:[${objName}],error:[${e.message}]}`);
            }
            return result;

        },
        deleteProperty:function (target, propKey){
            let result = Reflect.deleteProperty(target, propKey);
            console.log(`{deleteProperty|obj:[${objName}] -> prop:[${propKey.toString()}], result:[${result}]}`);
            return result;
        },
        has:function (target, propKey){ // in 操作符
            let result = Reflect.has(target, propKey);
            console.log(`{has|obj:[${objName}] -> prop:[${propKey.toString()}], result:[${result}]}`);
            return result;
        },
        ownKeys: function (target){
            let result = Reflect.ownKeys(target);
            console.log(`{ownKeys|obj:[${objName}]}`);
            return result
        },
        getPrototypeOf:function(target){
            let result = Reflect.getPrototypeOf(target);
            console.log(`{getPrototypeOf|obj:[${objName}]}`);
            return result;
        },
        setPrototypeOf:function(target, proto){
            let result = Reflect.setPrototypeOf(target, proto);
            console.log(`{setPrototypeOf|obj:[${objName}]}`);
            return result;
        },
        preventExtensions:function(target){
            let result = Reflect.preventExtensions(target, proto);
            console.log(`{preventExtensions|obj:[${objName}]}`);
            return result;
        },
        isExtensible:function(target){
            let result = Reflect.isExtensible(target, proto);
            console.log(`{isExtensible|obj:[${objName}]}`);
            return result;
        }
    };
    return new Proxy(obj, handler);
}
    // env函数分发器
    xzvm.toolsFunc.dispatch = function dispatch(self, obj, objName, funcName, argList, defaultValue){
        let name = `${objName}_${funcName}`; // EventTarget_addEventListener
        if(Object.getOwnPropertyDescriptor(obj, "constructor") !== undefined){
            if(Object.getOwnPropertyDescriptor(self, "constructor") !== undefined){
                // self 不是实例对象
                return xzvm.toolsFunc.throwError('TypeError', 'Illegal invocation');
            }
        }
        try{
            return xzvm.envFunc[name].apply(self, argList);
        }catch (e){
            if(defaultValue === undefined){
                console.log(`[${name}]正在执行，错误信息: ${e.message}`);
            }
            return defaultValue;
        }
    }
    // 定义对象属性defineProperty
    xzvm.toolsFunc.defineProperty = function defineProperty(obj, prop, oldDescriptor){
        let newDescriptor = {};
        newDescriptor.configurable = xzvm.config.proxy || oldDescriptor.configurable;// 如果开启代理必须是true
        newDescriptor.enumerable = oldDescriptor.enumerable;
        if(oldDescriptor.hasOwnProperty("writable")){
            newDescriptor.writable = xzvm.config.proxy || oldDescriptor.writable;// 如果开启代理必须是true
        }
        if(oldDescriptor.hasOwnProperty("value")){
            let value = oldDescriptor.value;
            if(typeof value === "function"){
                xzvm.toolsFunc.safeFunc(value, prop);
            }
            newDescriptor.value = value;
        }
        if(oldDescriptor.hasOwnProperty("get")){
            let get = oldDescriptor.get;
            if(typeof get === "function"){
                xzvm.toolsFunc.safeFunc(get, `get ${prop}`);
            }
            newDescriptor.get = get;
        }
        if(oldDescriptor.hasOwnProperty("set")){
            let set = oldDescriptor.set;
            if(typeof set === "function"){
                xzvm.toolsFunc.safeFunc(set, `set ${prop}`);
            }
            newDescriptor.set = set;
        }
        Object.defineProperty(obj, prop, newDescriptor);
    }
    // 函数native化
    !function (){
        const $toString = Function.prototype.toString;
        const symbol = Symbol(); // 独一无二的属性
        const myToString = function (){
            return typeof this === 'function' && this[symbol] || $toString.call(this);
        }
        function set_native(func, key, value){
            Object.defineProperty(func, key, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: value
            });
        }
        delete Function.prototype.toString;
        set_native(Function.prototype, "toString", myToString);
        set_native(Function.prototype.toString, symbol, "function toString() { [native code] }");
        xzvm.toolsFunc.setNative = function (func, funcname) {
            set_native(func, symbol, `function ${funcname || func.name || ''}() { [native code] }`);
        }
    }();
    // 对象重命名
    xzvm.toolsFunc.reNameObj = function reNameObj(obj, name){
        Object.defineProperty(obj.prototype, Symbol.toStringTag, {
            configurable:true,
            enumerable:false,
            value:name,
            writable:false
        });
    }
    // 函数重命名
    xzvm.toolsFunc.reNameFunc = function reNameFunc(func, name){
        Object.defineProperty(func, "name", {
            configurable:true,
            enumerable:false,
            writable:false,
            value:name
        });
    }
    // 函数保护方法
    xzvm.toolsFunc.safeFunc = function safeFunc(func, name){
        xzvm.toolsFunc.setNative(func, name);
        xzvm.toolsFunc.reNameFunc(func, name);
    }
    // 原型保护方法
    xzvm.toolsFunc.safeProto = function safeProto(obj, name){
        xzvm.toolsFunc.setNative(obj, name);
        xzvm.toolsFunc.reNameObj(obj, name);
    }
    // 抛错函数
    xzvm.toolsFunc.throwError = function throwError(name, message){
        let e = new Error();
        e.name = name;
        e.message = message;
        e.stack = `${name}: ${message}\n    at snippet://`;
        throw e;
    }
    // base64编码解码
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
        } while (i < len && c1 == -1);
        if (c1 == -1)
          break;

        /* c2 */
        do {
          c2 = xzvm.toolsFunc.base64.base64DecodeChars[str.charCodeAt(i++) & 0xff];
        } while (i < len && c2 == -1);
        if (c2 == -1)
          break;

        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

        /* c3 */
        do {
          c3 = str.charCodeAt(i++) & 0xff;
          if (c3 == 61)
            return out;
          c3 = xzvm.toolsFunc.base64.base64DecodeChars[c3];
        } while (i < len && c3 == -1);
        if (c3 == -1)
          break;

        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));

        /* c4 */
        do {
          c4 = str.charCodeAt(i++) & 0xff;
          if (c4 == 61)
            return out;
          c4 = xzvm.toolsFunc.base64.base64DecodeChars[c4];
        } while (i < len && c4 == -1);
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
//用户环境变量初始化
!function (){
    let onLeave = function (obj){
        obj.result = 1688028756666;
    }
    let onLeave2 = function (obj){
        obj.result = 0.5;
    }
    Date.now = xzvm.toolsFunc.hook(Date.now,undefined,false,function (){},onLeave);
    Date.prototype.getTime = xzvm.toolsFunc.hook(Date.prototype.getTime,undefined,false,function (){},onLeave);
    Math.random = xzvm.toolsFunc.hook(Math.random,undefined,false,function (){},onLeave2);

}()

//代理对象
window = xzvm.toolsFunc.proxy(window,"window")
document = xzvm.toolsFunc.proxy(document,"document")
location = xzvm.toolsFunc.proxy(location,"location")
console.log(Date.now()) //1688024936666
console.log(new Date().getTime()) //1688024936666
console.log(Math.random())  //0.5
//异步执行相关
