//主要用来保护伪造的函数  让其更难被识破
;;;;
(()=>{
    "use strict";
    const $toString = Function.toString;
    const myFunction_toString_symbol=Symbol('('.concat('',')_',(Math.random()+'').toString(36)));
    const myToString = function(){
        return typeof this == 'function' && this[myFunction_toString_symbol] || $toString.call(this);
    };
    function set_native(func,key,value){
        Object.defineProperty(func,key,{
            "enumerable":false,
            "configurable":true,
            "writable":true,
            "value":value
        })
    };
    delete Function.prototype['toString'];//删除原型链上的toString
    set_native(Function.prototype,"toString",myToString);//自己定义个getter方法
    set_native(Function.prototype.toString,myFunction_toString_symbol,"function toString() { [native code] }");
    globalThis.set_native = (func,funcname) =>{
        set_native(func,myFunction_toString_symbol,`function ${funcname || func.name || ''}() { [native code] }`);
    };//到出函数到globalThis
})();

add = function (a,b){
    return a+b;
}
set_native(add)
console.log(add.toString());