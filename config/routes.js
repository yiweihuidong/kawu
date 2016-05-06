var Index = require('../app/controllers/index')
var User = require('../app/controllers/user')
var Public = require('../app/controllers/public')


module.exports = function(app) {
	app.use(function(req, res, next){
		var _user = req.session.user
		if(_user){
			app.locals.user = _user
		}else{
			delete app.locals.user
		}
		next()
	})


	//check
	app.get(/user/,User.check)

	//public
	app.get('/imgcode',Public.imgcode)

	//index
	app.get('/',Index.index);
	app.get('/index.html',Index.index)
	app.get('/recovery.html',Index.recovery)
	app.get('/signin.html',Index.signin)
	app.get('/signup.html',Index.signup)

	//user
	app.get('/user/myaccount.html',User.myAccount)
	app.get('/user/mydatum.html',User.myDatum)
	app.get('/user/sellcards.html',User.sellCards)
	app.get('/user/setemail.html',User.setEmail)
	app.get('/user/setpassword.html',User.setPassword)
	app.get('/user/setorderpassword.html',User.setOrderPassword)
	app.get('/user/setphone.html',User.setPhone)
	app.get('/user/myorder.html',User.myOrder)
	app.get('/user/selldetail.html',User.sellDetail)
	//user sellcards
	app.post('/cardstype',User.cards)
	app.post('/cardsid',User.id)
	app.post('/sellCardsPost',User.sellCardsPost)


	//login
	app.post('/signin',User.signin)
	app.post('/signup',User.signup)
	app.post('/checkUsername',User.checkUsername)
	app.get('/out.html',function(req, res) {
		delete req.session.user
		delete app.locals.user
		return res.redirect("/")
	})

	//help and company
	app.get('/company/disclaimer.html',Index.disclaimer)
	app.get('/company/introduction.html',Index.introduction)
	app.get('/company/contctus.html',Index.contctus)
	app.get('/company/agreement.html',Index.agreement)
	app.get('/help/help.html',Index.help)
	app.get('/help/cooperation.html',Index.cooperation)
	app.get('/help/questions.html',Index.questions)
}






