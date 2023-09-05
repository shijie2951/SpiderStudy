//Storage对象
Storage = function Storage() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(Storage,"Storage");
xzvm.toolsFunc.defineProperty(Storage.prototype, "length", {enumerable: true, configurable: true,get:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","length_get",arguments)},set:undefined});
xzvm.toolsFunc.defineProperty(Storage.prototype, "clear", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","clear",arguments);}});
xzvm.toolsFunc.defineProperty(Storage.prototype, "getItem", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","getItem",arguments);}});
xzvm.toolsFunc.defineProperty(Storage.prototype, "key", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","key",arguments);}});
xzvm.toolsFunc.defineProperty(Storage.prototype, "removeItem", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","removeItem",arguments);}});
xzvm.toolsFunc.defineProperty(Storage.prototype, "setItem", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,Storage.prototype,"Storage","setItem",arguments);}});
//localStorage对象
localStorage = {}
Object.setPrototypeOf(localStorage, Storage.prototype);