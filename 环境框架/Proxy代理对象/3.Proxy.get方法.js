xz = {};
xz.config = {};
xz.config.proxy = true;
xz.getType = function getType(obj){
    return Object.prototype.toString.call(obj);
}
xz.proxy = function proxy(obj, objName) {
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
                    console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${type}]}`);
                    //递归代理
                    result=xz.proxy(result,`${objName}.${prop.toString()}`)
                }else {
                    console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}] -> result:[${result}]}`);
                }
            } catch (e) {
                console.log(`{get|obj:[${objName}] -> prop:[${prop.toString()}],error[${e.message}}]`);
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

console.log(user[symbol]);
console.log(user["tt"]);
console.log(user["tt"]["aa"]);