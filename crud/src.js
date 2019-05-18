var Exp = require('express')
var app = Exp()
var bodyParser = require("body-parser");
var u = require('./routes/link.routes.js')
console.log(u.router)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/', u.router)
app.listen(3000);