var express = require('express')
var bodyParser = require('body-parser')
var path = require('path')



var port = process.env.PORT || 3000
var app = express()

var cookiceParser = require('cookie-parser')
//session
var session = require('express-session');
var RedisStore = require('connect-redis')(session);


app.set('views','./app/views/pages')
app.engine('.html', require('ejs').__express);
app.set('view engine','html')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


app.use(cookiceParser('boke'))
app.use(session({
  store: new RedisStore({
    host: "127.0.0.1",
    port: 6379,
    db: "0",
    ttl : 3000000
  }),
  resave:false,
  saveUninitialized:true,
  secret: 'keyboard cat',
  cookie: {maxAge: 3000000}
}))




require('./config/routes')(app)
app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.static(path.join(__dirname, 'public')))
// app.use(bodyParser())
app.locals.moment = require('moment')
app.listen(port)


console.log('boke started on port ' + port)



