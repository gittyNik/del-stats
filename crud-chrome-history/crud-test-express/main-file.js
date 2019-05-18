var d=require('express')
var app= d()
var bodyParser = require("body-parser");
var u=require('./routes/link.routes.js')
console.log(u.router)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/',u.router)
//app.post('/ac/bd',function(req,res){ res.end('hello tata')});
app.listen(3000);