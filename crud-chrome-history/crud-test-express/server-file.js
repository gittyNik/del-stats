var d=require('express')
var app= d()
//va = rer bodyParserquire("body-parser");
//var u=require('./routes/link.routes.js')
//console.log(u.router)
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use('/',u.router)

app.post('/ac/bd',function(req,res){  
    var myurl=req.body.url;
    var gid=req.body.getid;
    console.log(myurl);
    var Resource=require('./models/link')
    Resource.links.sync({force: false}).then(function () {
        return Resource.links.create({
          uid: gid,
          url: myurl
        })
        .catch(function(err) {
            // print the error details
            console.log(err);
        });
        
      });   
    
});

app.listen(3000);