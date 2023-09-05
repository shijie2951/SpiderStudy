WindowProperties=function WindowProperties(){

}
//函数native化
xzvm.toolsFunc.set_native(WindowProperties,"WindowProperties")
//修改对象名称
xzvm.toolsFunc.reNameObj(WindowProperties,"WindowProperties")
//设置WindowProperties.prototype的原型对象
Object.setPrototypeOf(WindowProperties.prototype,EventTarget.prototype);
//删除构造函数
delete WindowProperties.prototype.constructor;