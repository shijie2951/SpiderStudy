EventTarget=function EventTarget(){

}
//保护原型
xzvm.toolsFunc.safeProto(EventTarget,"EventTarget")

xzvm.toolsFunc.defineProperty(EventTarget.prototype,"addEventListener",{
    value:function (){
        return xzvm.toolsFunc.dispatch(this,EventTarget.prototype,"EventTarget","addEventListener",arguments);
    }
})
