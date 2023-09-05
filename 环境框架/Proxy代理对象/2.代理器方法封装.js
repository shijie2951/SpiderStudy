xz = {};
xz.config = {};
xz.config.proxy = true;
xz.proxy = function proxy(obj, objName) {
    if (!xz.config.proxy) {
        return obj;
    }
    let handler = {
        get: function (target, prop, receiver) {
            console.log(`${objName}正在获取  ${prop.toString()}`);
            result = Reflect.get(target, prop, receiver) //反射，执行原始函数
            console.log(`返回值 ${result}`)
            return result
        }
    };
    return new Proxy(obj,handler)
}

let symbol=Symbol(123);
let user={
    "name":"小明",
    1:2,
    [symbol]:"symbol123"
}

user=xz.proxy(user,"user")

console.log(user[symbol]);
