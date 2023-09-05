//Window对象
Window = function Window() {
    xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")
}
//函数native化
xzvm.toolsFunc.set_native(Window, "Window")
//修改对象名称
xzvm.toolsFunc.reNameObj(Window, "Window")
//设置Window.prototype的原型对象
Object.setPrototypeOf(Window.prototype, WindowProperties.prototype);
//Window原型的属性
Object.defineProperty(Window, "PERSISTENT", {
    configurable: false,
    enumerable: true,
    value: 1
})
Object.defineProperty(Window, "TEMPORARY", {
    configurable: false,
    enumerable: true,
    value: 0
})
//Window.prototype:原型对象属性
Object.defineProperty(Window.prototype, "PERSISTENT", {
    configurable: false,
    enumerable: true,
    value: 1
})
Object.defineProperty(Window.prototype, "TEMPORARY", {
    configurable: false,
    enumerable: true,
    value: 0
})


