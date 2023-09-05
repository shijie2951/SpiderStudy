//document对象
document = {}
xzvm.toolsFunc.defineProperty(document, "location", {
    enumerable: true,
    configurable: false,
    get:function (){
        return xzvm.toolsFunc.dispatch(this,document,"document","location_get",arguments)
    },
    set:function (){
    return xzvm.toolsFunc.dispatch(this,document,"document","location_set",arguments)
    }
}
);

