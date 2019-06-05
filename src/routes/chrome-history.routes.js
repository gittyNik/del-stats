var Express=require('express')
var controller=require('../controllers/chrome-history.controller')
const router=Express.Router()

router.post('/insert',function(req,res){  
    var historyitem=req.body.historyitem;
    var gid=req.body.getid;
    console.log("welcome");
    var Resource=require('../models/chrome-history');
    
    
        
      ( function(historyitem,gid){
        var sequelize=require('sequelize');
         Resource.links.findAll({ 
        attributes: [[sequelize.fn('max', sequelize.col('visited_timestamp')), 'time']],
        where:{
          user_id:gid
        },
        raw: true,
      }).then( (data) => {
        for(var i=0;i<historyitem.length;i++){
           (function(i,historyitem,gid,data){Resource.links.sync({force: false}).then(function () {
          if(data[0]['time']==null || data[0]['time']<historyitem[i]['lastVisitTime'])
         { 
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
        }
        else{
          return true;
        }
        })
        .catch(function(err) {
          console.log(err);
      })})(i,historyitem,gid,data);

      console.log("hero")

      } }).catch((err) => {
      console.log(err);
      })
      
      
      
    })(historyitem,gid);
    
    
      
    /*(function(i,historyitem,gid){Resource.links.sync({force: false}).then(function () {
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
  })})(i,historyitem,gid);*/


  
});

router.get('/allresults', controller.getAll);
router.get('/max',controller.getMax);
 
export default router;
