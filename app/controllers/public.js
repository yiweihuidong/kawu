var ccap = require('ccap')();//Instantiated ccap class 
var common = require('../../config/common')

// Verification code
exports.imgcode = function(req, res) {
	// console.log(req.query.time)
    if(req.url == '/favicon.ico')return res.end('');//Intercept request favicon.ico

    var ary = ccap.get();

    var txt = ary[0];

    var buf = ary[1];
    req.session.imgcode = txt;

    res.end(buf);
    // console.log(txt);
    // console.log(req.session.imgcode)
}
exports.yanimgcode = function(req, res, next) {
	var imgcode = req.body.imgcode;
	var s_imgcode = req.session.imgcode;
	if(imgcode != s_imgcode){
		res.json(common.resjson(400, "验证码错误",{}))
	}else{
		next();
	}
}