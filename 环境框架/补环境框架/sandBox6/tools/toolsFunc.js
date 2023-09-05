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