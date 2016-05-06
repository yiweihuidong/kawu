exports.resjson = function(code,msg,data){
    if(msg == ""){
        msg = "服务器异常"
    }
    var resmsg = {
        code : code,
        msg : msg,
        data : data
    }
    return (resmsg) 
}