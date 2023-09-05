//HTMLDocument对象
HTMLDocument = function HTMLDocument() {xzvm.toolsFunc.throwError("TypeError", "Illegal constructor")}
xzvm.toolsFunc.safeProto(HTMLDocument,"HTMLDocument");
Object.setPrototypeOf(HTMLDocument.prototype, Document.prototype);

//document对象
document = {}
Object.setPrototypeOf(document, HTMLDocument.prototype);
xzvm.toolsFunc.defineProperty(document, "location", {enumerable: true, configurable: false,get:function (){return xzvm.toolsFunc.dispatch(this,document,"document","location_get",arguments)},set:function (){return xzvm.toolsFunc.dispatch(this,document,"document","location_set",arguments)}});