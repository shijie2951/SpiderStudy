xz = {}; //全局对象

//主要用来保护伪造的函数  让其更难被识破
//封装保护函数
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
    }

    delete Function.prototype['toString'];//删除原型链上的toString
    set_native(Function.prototype, "toString", myToString);//自己定义个getter方法
    set_native(Function.prototype.toString, myFunction_toString_symbol, "function toString() { [native code] }");
    xz.set_native = (func, funcname) => {
        set_native(func, myFunction_toString_symbol, `function ${funcname || func.name || ''}() { [native code] }`);
    };//到出函数到globalThis
}();


//函数重命名
xz.reNameFunc = function reNameFunc(func, name) {
    Object.defineProperty(func, "name", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: name
    })
}


//实现hook插件
xz.hook = function hook(func, funcInfo, isDebug, onEnter, onLeave, isExec) {
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
    xz.set_native(hookFunc, funcInfo.funcName);
    xz.reNameFunc(hookFunc, funcInfo.funcName)
    return hookFunc
}


//hook对象的属性，本质为替换属性描述符
xz.hookObj = function hookObj(obj, objName, propName, isDebug) {
    //obj : 需要hook的对象
    //objName :hook对象的名字
    //propName ：需要hook对象的属性名
    //isDebug  :是否需要debugger
    let oldDescriptor = Object.getOwnPropertyDescriptor(obj, propName);
    let newDescriptor = {};
    if (!oldDescriptor.configurable) {
        return;
    }
    //必须有的描述属性
    newDescriptor.configurable = true;
    newDescriptor.enumerable = oldDescriptor.enumerable;
    if (oldDescriptor.hasOwnProperty("writable")) {
        newDescriptor.writable = oldDescriptor.writable;
    }
    if (oldDescriptor.hasOwnProperty("value")) {
        let value = oldDescriptor.value;
        if (typeof value !== 'function') {
            return;
        }
        let funcInfo = {
            "objName": objName,
            "funcName": propName
        }
        newDescriptor.value = xz.hook(value, funcInfo, isDebug)
    }
    if (oldDescriptor.hasOwnProperty("get")) {
        let get = oldDescriptor.get;
        let funcInfo = {
            "objName": objName,
            "funcName": `get ${propName}`
        }
        newDescriptor.get = xz.hook(get, funcInfo, isDebug)
    }
    if (oldDescriptor.hasOwnProperty("set")) {
        let set = oldDescriptor.set;
        let funcInfo = {
            "objName": objName,
            "funcName": `set ${propName}`
        }
        newDescriptor.set = xz.hook(set, funcInfo, isDebug)
    }
    Object.defineProperty(obj, propName, newDescriptor);
}

//hook 原型对象的所有属性
xz.hookProto = function hookProto(proto,isDebug){
    // proto : 函数原型
    // isDebug : 是否debugger
    let protoObj = proto.prototype;
    let name=proto.name;
    for (const prop in Object.getOwnPropertyDescriptors(protoObj)){
        xz.hookObj(protoObj,`${name}.prototype`,prop,isDebug);
    }
    console.log(`hook ${name}.prototype`);
}

