xz = {};
xz.config = {};
xz.config.proxy = true;
xz.getType = function getType(obj){
    return Object.prototype.toString.call(obj);
}
xz.proxy = function proxy(obj, objName) {
    //obj :原始对象
    //objName :原始对象的名字
    if (!xz.config.proxy) {
        return obj;
    }
    let handler = {
        get: function (target, prop, receiver) {
            let result;
            try {
                result = Reflect.get(target, prop, receiver);
                let type=xz.getType(result)
                if (result instanceof Object){
                    console.log(`{get |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${type}]}`);
                    //递归代理
                    result=xz.proxy(result,`${objName}.${prop.toString()}`)
                }else {
                    console.log(`{get |obj:[${objName}] -> prop:[${prop.toString()}] -> result:[${result}]}`);
                }
            } catch (e) {
                console.log(`{get |obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
            }
            return result;
        },
        set: function (target, prop,value, receiver) {
            let result;
            try {
                result = Reflect.set(target, prop,value, receiver);
                let type=xz.getType(value)
                if (result instanceof Object){
                    console.log(`{set |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${value}]}`);
                    //递归代理
                }else {
                    console.log(`{set |obj:[${objName}] -> prop:[${prop.toString()}] -> value:[${value}]}`);
                }
            } catch (e) {
                console.log(`{set |obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
            }
            return result;
        },
        getOwnPropertyDescriptor:function (target,prop){
            let result; //undefined，描述符对象
            try {
                result=Reflect.getOwnPropertyDescriptor(target,prop);
                let type=xz.getType(result);
                console.log(`{getOwnPropertyDescriptor |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${type}]}`);
                // if (typeof result!=="undefined"){
                //     result=xz.proxy(result,`${objName}.${prop.toString()}.PropertyDescriptor`)
                // }
            }catch (e) {
             console.log(`{getOwnPropertyDescriptor |obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
            }
            return result;
        },
        defineProperty:function (target, prop, descriptor){
            let result; //undefined，描述符对象
            try {
                result=Reflect.defineProperty(target, prop, descriptor);
                console.log(`{defineProperty |obj:[${objName}] -> prop:[${prop.toString()}]`);
            }catch (e) {
             console.log(`{defineProperty |obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
            }
            return result;
        }
    };
    return new Proxy(obj, handler)
}
let symbol=Symbol(123);
let user={
    "name":"小明",
    1:2,
    [symbol]:"symbol123",
    "tt":{
        "aa":"11",
        "bb":"22"
    }
}

user=xz.proxy(user,"user")

// console.log(user[symbol]);
// console.log(user["tt"]);
// console.log(user["tt"]["aa"]);
//
//
// console.log("=====================")
// console.log(user.shijie="666")
// console.log(Object.getOwnPropertyDescriptor(user, "name"));

user.ss="小明"
