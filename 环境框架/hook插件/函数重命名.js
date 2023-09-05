reNameFunc = function reNameFunc(func,name){
    Object.defineProperty(func,"name",{
        configurable:true,
        enumerable:false,
        writable:true,
        value:name
    })
}

add = function xxx(){
    return a+b;
}

reNameFunc(add,"add")

console.log(add.name);
