//Window对象
Window = function Window() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(Window,"Window");
Object.setPrototypeOf(Window.prototype, WindowProperties.prototype);
xzvm.toolsFunc.defineProperty(Window, "TEMPORARY", {enumerable: true, configurable: false,writable: false,value: 0});
xzvm.toolsFunc.defineProperty(Window, "PERSISTENT", {enumerable: true, configurable: false,writable: false,value: 1});
xzvm.toolsFunc.defineProperty(Window.prototype, "TEMPORARY", {enumerable: true, configurable: false,writable: false,value: 0});
xzvm.toolsFunc.defineProperty(Window.prototype, "PERSISTENT", {enumerable: true, configurable: false,writable: false,value: 1});
