// proxy作用 ： 监控对象操作
// reflect作用 : 执行原始操作
let symbol=Symbol(123);
let user={
    "name":"小明",
    1:2,
    [symbol]:"symbol123"
}
//第一个参数:  原始对象
//第二个参数:  handler,也是对象
let userProxy=new Proxy(user,{
        get:function (target, prop, receiver) {
            console.log(`正在获取  ${prop.toString()}`);
            result=Reflect.get(target,prop,receiver) //反射，执行原始函数
            console.log(`返回值 ${result}`)
            return result
        }
})
console.log(userProxy[symbol]);
