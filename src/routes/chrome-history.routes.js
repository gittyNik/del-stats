var Express=require('express')
var controller=require('../controllers/chrome-history.controller')
const router=Express.Router()

router.post('/insert',function(req,res){  
    var historyitem=req.body.historyitem;
    var gid=req.body.getid;
    var Resource=require('../models/chrome-history')
    for(var i=0;i<historyitem.length;i++){
    (function(i,historyitem,gid){Resource.links.sync({force: false}).then(function () {
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
            console.log(err);
        });
      })
      .catch(function(err) {
        console.log(err);
    })})(i,historyitem,gid);
  }    
});

router.get('/allresults', controller.getAll);
router.get('/max',controller.getMax);
 
export default router;
