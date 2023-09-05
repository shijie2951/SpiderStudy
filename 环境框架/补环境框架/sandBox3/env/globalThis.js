//window对象
//删除浏览器中不存在的对象
delete global;
delete Buffer;
delete WindowProperties;
window = globalThis;
Object.setPrototypeOf(window,Window.prototype);


//定义window中的方法
Object.defineProperty(window,"atob",{
    value:function atob(str){
        return xzvm.toolsFunc.base64.base64decode(str);
    }
})
xzvm.toolsFunc.safeFunc(window.atob,"atob")

Object.defineProperty(window,"btoa",{
    value:function btoa(str){
        return xzvm.toolsFunc.base64.base64encode(str);
    }
})
xzvm.toolsFunc.safeFunc(window.btoa,"btoa")