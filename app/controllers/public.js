var ccap = require('ccap')();//Instantiated ccap class 

// Verification code
exports.imgcode = function(req, res) {
	// console.log(req.query.time)
    if(req.url == '/favicon.ico')return res.end('');//Intercept request favicon.ico

    var ary = ccap.get();

    var txt = ary[0];

    var buf = ary[1];

    res.end(buf);
    req.session.imgcode = txt;
    // console.log(txt);
    // console.log(req.session.imgcode)
}