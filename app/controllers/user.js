//mysql
var mysql = require('mysql');
var TEST_DATABASE = 'kawu';  
var TEST_TABLE = 'tbl_member_info';
var CARDS_TYPE = 'tbl_card_info'; 
var mysqlmsg = {
	user: 'root',  
  	password: 'yiweihuidong',  
}
//md5
var crypto = require('crypto');
//express
var express = require('express');
var app = express();

var common = require('../../config/common')

exports.check = function(req, res, next) {
	var user = req.session.user;
	if(user == 'undefined' || user == undefined){
		res.redirect("/signin.html") 
	}else{
		next();
	}
}
//index

exports.myAccount = function(req, res) {
	var _user = req.session.user;
	var client = mysql.createConnection(mysqlmsg); 
	client.connect();
	client.query("use " + TEST_DATABASE);
	client.query("select * from tbl_member_info where member_code='"+_user.member_code+"'", function(err, results, fields) {
	  if(err){
	  	console.log(err)
	  }
	  if(results != ""){
	  	var usermsg = results[0];
	  	// console.log(usermsg)
		res.render('admin/myAccount',{
			title: '我的帐户',
			usermsg : usermsg
		});
	  }
	});
	client.end();
}
exports.myDatum = function(req, res) {
	var _user = req.session.user;
	var client = mysql.createConnection(mysqlmsg); 
	client.connect();
	client.query("use " + TEST_DATABASE);
	client.query("select * from tbl_member_info where member_code='"+_user.member_code+"'", function(err, results, fields) {
	  if(err){
	  	console.log(err)
	  }
	  if(results != ""){
	  	var usermsg = results[0];
		res.render('admin/myDatum',{
			title: '我的资料',
			usermsg : usermsg
		});
	  }
	});
	client.end();
}
exports.sellCards = function(req, res) {
	var client = mysql.createConnection(mysqlmsg);
	client.connect();
	client.query("use " + TEST_DATABASE);
	client.query("select name,code from tbl_sys_codes where type='CARD_TYPE'", function(err, results, fields) {
	  if(err){
	  	console.log(err)
	  }
	  if(results != ""){
	  	var cards = results;
	  	client.query("select card_name,card_desc,id,logo_url,card_type from tbl_card_info", function(err, results, fields) {
		  if(err){
		  	console.log(err)
		  }
		  if(results != ""){
		  	var cardstypes = results[0];
			client.query("select bid_price,card_id,face_value,img_url from tbl_card_price", function(err, results, fields) {
			  if(err){
			  	console.log(err)
			  }
			  if(results != ""){
			  	var cardsprice = results;
			  	cardstypes.cardsprice = cardsprice[0];
			  	cards[0].cardstypes = cardstypes;
			  	console.log(cardstypes.cardsprice)
	  			console.log(cards);
			  	res.render('admin/sellCards',{
					title: '我要卖卡',
					cards: cards
				});
			  }
			});
		  }
		});
	  }
	});
	// client.end();
}
exports.cards = function(req, res) {
	var cards = req.body；
	if(cards){
		var cardstype = cards.cardstype;
		client.query("select card_name,card_desc,id,logo_url,card_type from tbl_card_info where card_type='"+cardstype+"'", function(err, results, fields) {
		  if(err){
		  	res.json(config.resjson(400, "未知错误",{}))
		  	console.log(err)
		  }
		  if(results != ""){
		  	res.json(config.resjson(200, "获取成功",results))
		  	console.log(results)
		  }
		});
	}else{
		res.json(config.resjson(400, "缺少参数",{}))
	}
}
exports.id = function(req, res) {
	var cards = req.body；
	if(cards){
		var cardsid = cards.cardsid;
		client.query("select card_name,card_desc,id,logo_url,card_type from tbl_card_price where card_id='"+cardsid+"'", function(err, results, fields) {
		  if(err){
		  	res.json(config.resjson(400, "未知错误",{}))
		  	console.log(err)
		  }
		  if(results != ""){
		  	res.json(config.resjson(200, "获取成功",results))
		  	console.log(results)
		  }
		});
	}else{
		res.json(config.resjson(400, "缺少参数",{}))
	}
}
exports.setEmail = function(req, res) {
	res.render('admin/setEmail',{
		title: '设置邮箱'
	});
}
exports.setPassword = function(req, res) {
	res.render('admin/setPassword',{
		title: '设置密码'
	});
}
exports.setOrderPassword = function(req, res) {
	res.render('admin/setOrderPassword',{
		title: '设置支付密码'
	});
}
exports.setPhone = function(req, res) {
	res.render('admin/setPhone',{
		title: '设置手机'
	});
}
exports.myOrder = function(req, res) {
	res.render('admin/myOrder',{
		title: '我的订单'
	});
}
exports.sellDetail = function(req, res) {
	res.render('admin/sellDetail',{
		title: '卖卡记录'
	});
}


//signin 
exports.signin = function(req, res) {
	var _user = req.body
	// console.log(_user.username)

	var content = _user.password;
	var md5 = crypto.createHash('md5');
	md5.update(content);
	var password = md5.digest('hex'); 



	var client = mysql.createConnection(mysqlmsg); 
	client.connect();
	client.query("use " + TEST_DATABASE);
	// client.query("select * from '"+TEST_TABLE+"' where member_code='"+_user.username+"'", function(err, results, fields) {
	client.query("select * from tbl_member_info where member_code='"+_user.username+"'", function(err, results, fields) {
	  if(err){
	  	console.log(err)
	  }
	  if(results != ""){
	  	console.log(results)
	  	if(password == results[0].login_password){
	  		req.session.user = results[0];
			res.redirect("/user/myaccount.html")  	
		}else{
	  		res.redirect("/signin.html")  
	  	}
	  }else{
	  	res.redirect("/signin.html")
	  }
	});

	client.end();
}
//check username
exports.checkUsername = function(req, res) {
	var _user = req.body

	var client = mysql.createConnection(mysqlmsg); 
	client.connect();
	client.query("use " + TEST_DATABASE);
	//client.query("select count(*) as value from '"+TEST_TABLE+"' where member_code='"+_user.username+"'", function(err, results, fields) {
	client.query("select count(*) as value from tbl_member_info where member_code='"+_user.username+"'", function(err, results, fields) {
	  if(err){
	  	console.log(err)
	  }
	  if(results){
	  	if(results > 0){
	  		res.json(common.resjson(400, "已经使用",{}))
	  	}else{
	  		res.json(common.resjson(200, "可以使用",{}))
	  	}
	  }
	});
	client.end();
}
//signup
exports.signup = function(req, res) {
	var _user = req.body
	console.log(_user)

	var content = _user.userpassword;
	var md5 = crypto.createHash('md5');
	md5.update(content);
	var password = md5.digest('hex'); 

	var create_time=new Date().getTime();
	console.log(create_time)
	//创建连接  

	var client = mysql.createConnection(mysqlmsg); 
	client.connect();
	client.query("use " + TEST_DATABASE);
	//client.query("select count(*) from '"+TEST_TABLE+"' where member_code='"+_user.username+"'", function(err, results, fields) {
	client.query("select count(*) as value from tbl_member_info where member_code='"+_user.username+"'", function(err, results, fields) {
	  if(err){
	  	console.log(err)
	  }
	  if(results){
	  	if(results[0].value > 0){
	  		res.redirect("/signup.html")
	  		console.log("该用户已经注册")
	  	}else{
	  		client.query('INSERT INTO '+TEST_TABLE +"(member_code,member_name,cell_phone,email,pay_password,login_password,id,create_time,balance,status,is_deleted,weixin) VALUES ('"+_user.username+"', '','','','','"+password+"', "+create_time+", '"+create_time+"', 0,0,0,'')",function selectCb(err, results, fields){  
			    if (err) {
			      	res.redirect("/signup.html")
					console.log(err)
			    }
			    if(results){
					client.query("select * from tbl_member_info where member_code='"+_user.username+"'", function(err, results, fields) {
						if(err){
					  		console.log(err)
						}
					  	if(results){
				  			req.session.user = results[0];
							res.redirect("/user/myaccount.html")
				  		}
					});
			    }   
			    client.end();  
		    });
	  	}
	  }
	});
}