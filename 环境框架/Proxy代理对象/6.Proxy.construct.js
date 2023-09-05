xz = {};
xz.config = {};
xz.config.proxy = true;
xz.getType = function getType(obj) {
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
                let type = xz.getType(result)
                if (result instanceof Object) {
                    console.log(`{get |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${type}]}`);
                    //递归代理
                    result = xz.proxy(result, `${objName}.${prop.toString()}`)
                } else {
                    console.log(`{get |obj:[${objName}] -> prop:[${prop.toString()}] -> result:[${result.toString()}]}`);
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
                let type = xz.getType(value)
                if (result instanceof Object) {
                    console.log(`{set |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${value}]}`);
                    //递归代理
                } else {
                    console.log(`{set |obj:[${objName}] -> prop:[${prop.toString()}] -> value:[${value.toString()}]}`);
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
                let type = xz.getType(result);
                console.log(`{getOwnPropertyDescriptor |obj:[${objName}] -> prop:[${prop.toString()}] -> type:[${type}]}`);
                // if (typeof result!=="undefined"){
                //     result=xz.proxy(result,`${objName}.${prop.toString()}.PropertyDescriptor`)
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
                let type = xz.getType(result)
                if (result instanceof Object) {
                    console.log(`{apply |function:[${objName}]  -> type:[${type}]}`);
                } else {
                    console.log(`{apply |function:[${objName}]  -> result:[${result.toString()}]}`);
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
                let type = xz.getType(result)
                console.log(`{construct |function:[${objName}]  -> type:[${type}]}`);

            } catch (e) {
                console.log(`{construct |function:[${objName}], error[${e.message}}]`);
            }
            return result;
        }
    };
    return new Proxy(obj, handler)
}

function User() {

}

Object.defineProperty(User.prototype, Symbol.toStringTag, {
    value:"UserTest"
})
User = xz.proxy(User,"User")
u = new User()