//用户环境变量初始化
!function (){
    let onLeave = function (obj){
        obj.result = 1688028756666;
    }
    let onLeave2 = function (obj){
        obj.result = 0.5;
    }
    Date.now = xzvm.toolsFunc.hook(Date.now,undefined,false,function (){},onLeave);
    Date.prototype.getTime = xzvm.toolsFunc.hook(Date.prototype.getTime,undefined,false,function (){},onLeave);
    Math.random = xzvm.toolsFunc.hook(Math.random,undefined,false,function (){},onLeave2);

}()
