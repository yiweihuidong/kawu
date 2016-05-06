// index page
exports.index = function(req, res) {
    res.render('index',{
        title: '首页',
    });
}
exports.recovery = function(req, res) {
    res.render('recovery',{
        title: '卡回收',
    });
}
exports.signin = function(req, res) {
    var user = req.session.user;
    if(user == 'undefined' || user == undefined){
        res.render('signin',{
            title: '登录',
        });
    }else{
        res.redirect("/user/myaccount.html")
    }  
}
exports.signup = function(req, res) {
    var user = req.session.user;
    if(user == 'undefined' || user == undefined){
        res.render('signup',{
            title: '注册',
        });
    }else{
        res.redirect("/user/myaccount.html")
    }
}
//company
exports.disclaimer = function(req, res) {
    res.render('disclaimer',{
        title: '免责声明',
    });
}
exports.introduction = function(req, res) {
    res.render('introduction',{
        title: '公司简介',
    });
}
exports.contctus = function(req, res) {
    res.render('contctus',{
        title: '注册协议',
    });
}
exports.agreement = function(req, res) {
    res.render('agreement',{
        title: '联系我们',
    });
}
exports.help = function(req, res) {
    res.render('help',{
        title: '交易方式',
    });
}
exports.cooperation = function(req, res) {
    res.render('cooperation',{
        title: '商家合作',
    });
}
exports.questions = function(req, res) {
    res.render('questions',{
        title: '常见问题',
    });
}