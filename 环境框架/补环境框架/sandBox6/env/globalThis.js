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