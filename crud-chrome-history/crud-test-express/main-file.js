var d=require('express')
var app= d()
var bodyParser = require("body-parser");
var u=require('./routes/link.routes.js')
console.log(u.router)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/',u.router)
var myurl;
app.post('/ac/bd',function(req,res){  myurl=req.body.url; console.log(myurl);  });

app.listen(3000);


