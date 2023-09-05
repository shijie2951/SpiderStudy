(function (){
    var token=""
    Object.defineProperty(window,"GEERANDOMTOKEN",{
        set:function (val){
            console.log('GEERANDOMTOKEN->',val)
            debugger;
            token=val;
            return val;
        },
        get:function (){
            return token;
        }
    })
})();