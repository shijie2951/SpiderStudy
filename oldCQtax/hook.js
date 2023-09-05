var v = "";

Object.defineProperty(document, "cookie", {

    set:function (val){
        debugger;
        v = val;
        return v;

    },
    get(){
        return v;
    }

})



let eval_ = eval;
eval = function (xx){
    debugger;
    console.log(xx)
    eval_(xx)
}












/*


var v = "";
Object.defineProperty(document, "cookie", {

    set(val){
        // 设置cookie 断点
        debugger;
        v = val;
        return v;

        }
    ,
    // 直接返回
    get(){
        return v;
    }


})


 */