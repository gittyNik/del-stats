var Express=require('express')
var controller=require('../controllers/chrome-history.controller')

const router=Express.Router()
//console.log(controller.insert)
//router.get('/:id', controller.getOne)
//app.use('/',u.router)

router.post('/insert',function(req,res){  
    var historyitem=req.body.historyitem;
    console.log("welcome");
    var gid=req.body.getid;
    
    //console.log(myurl);
    var Resource=require('../models/chrome-history')
    //console.log(historyitem);
    for(var i=0;i<historyitem.length;i++){
      
  
    (function(i,historyitem,gid){Resource.links.sync({force: false}).then(function () {
      //console.log(historyitem[i])
        return Resource.links.create({
          user_id: gid,
          url: historyitem[i].url,
          ip:  historyitem[i]['ip'],
          visited_timestamp: historyitem[i]['lastVisitTime'],
          title: historyitem[i]['title'],
          visitcount: historyitem[i]['visitCount'],
          useragent: historyitem[i]['userAgent']
        })
        .catch(function(err) {
            // print the error details
            console.log(err);
        });
        
      })
      .catch(function(err) {
        // print the error details
        res.end('hhh');
        console.log(err);
    })})(i,historyitem,gid);
  }

 
  
    
});

router.get('/allresults', controller.getAll);
router.get('/max',controller.getMax);
//router.post('/insert/:id', X.insert); //should check using postman 

export default router;
