//mysql
var mysql = require('mysql');
var TEST_DATABASE = 'kawu';  
var TEST_TABLE = 'tbl_member_info';

var client = mysql.createConnection({  
  user: 'root',  
  password: 'yiweihuidong',  
});