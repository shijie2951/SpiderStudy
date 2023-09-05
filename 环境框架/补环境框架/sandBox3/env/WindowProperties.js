WindowProperties=function WindowProperties(){

}
//保护原型
xzvm.toolsFunc.safeProto(WindowProperties,"WindowProperties")
//设置WindowProperties.prototype的原型对象
Object.setPrototypeOf(WindowProperties.prototype,EventTarget.prototype);
//删除构造函数
delete WindowProperties.prototype.constructor;