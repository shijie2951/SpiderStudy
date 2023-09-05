!function (){
    xzvm.toolsFunc.printLog = function printLog(logList){
        let log = "";
        for (let i = 0; i < logList.length; i++) {
            if (logList[i] instanceof Object){
                if (typeof logList[i] === "function"){
                    log += logList[i].toString()+ " ";
                }else{
                    log += xzvm.toolsFunc.getType(logList[i]) + " ";
                }
            }else if(typeof logList[i] === "symbol"){
                log += logList[i].toString()+ " ";
            }else{
                log += logList[i]+ " ";
            }
        }
        log += "\r\n";
        fs.appendFileSync(`./user/${_name_}/log.txt`,log)
    }
}();