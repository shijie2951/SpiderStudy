//EventTarget对象
EventTarget = function EventTarget() {}
xzvm.toolsFunc.safeProto(EventTarget,"EventTarget");
xzvm.toolsFunc.defineProperty(EventTarget.prototype, "addEventListener", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","addEventListener",arguments);}});
xzvm.toolsFunc.defineProperty(EventTarget.prototype, "dispatchEvent", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","dispatchEvent",arguments);}});
xzvm.toolsFunc.defineProperty(EventTarget.prototype, "removeEventListener", {enumerable: true, configurable: true,writable: true,value:function (){return xzvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","removeEventListener",arguments);}});
