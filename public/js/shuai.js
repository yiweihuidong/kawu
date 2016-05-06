var host = "http://127.0.0.1:3000";
function sajax(url,type,data,callback){
	$.ajax({
        "url": host + url,
        "type": type,
        "data": data,
        "cache": false,
        "dataType": 'json',
        beforeSend: function () {},
        success: function (data) {
            if (data) {
                callback(data);
            }
        },
        error: function (e) {
//            alert(JSON.stringify(e));
        }
    });
}