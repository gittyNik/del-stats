import {browser_history} from '../../models/browser-history';
var localStorage=require('localStorage');
var ip=require('ip');
export const getAll= function(req,res){browser_history.findAll({}).then((data) => {
    res.json(data)
  }).catch((err) => {
    console.log(err);
  })
}

export const getOne= function(req,res){browser_history.findAll({ 
  where: {
        uid: req.params.id
    } 
  }).then((data) => {res.json(data)})
  .catch((err) => {console.log(err);})
}

export const getMax= (req,res)=>{
  var sequelize=require('sequelize');
  browser_history.findAll({ 
    attributes: [[sequelize.fn('max', sequelize.col('visited_timestamp')), 'time']],
    where:{
      uid:'8e3cb23a-90cc-11e9-bc42-526af7764f64'
    },
    raw: true,
  }).then((data) => {
    res.json(data)
  }).catch((err) => {
  console.log(err);
  })
}

export const insert= function(req,res){  
  var historyitem=req.body.historyitem;
  var gid=req.body.getid;
  var browser_history=require('../../models/browser-history');     
  ( function(historyitem,gid){
      var sequelize=require('sequelize');
      browser_history.browser_history.findAll({ 
      attributes: [[sequelize.fn('max', sequelize.col('visited_timestamp')), 'time']],
      where:{
        uid:'8e3cb23a-90cc-11e9-bc42-526af7764f64'
      },
      raw: true,
    }).then( async (data) => {
      for(var i=0;i<historyitem.length;i++){
        var promise=new Promise((resolve,reject)=>{(function(i,historyitem,gid,data){browser_history.browser_history.sync({force: false}).then(function () {
        var urlTime=Date.parse(historyitem[i]['lastVisitTime']);
        if(data[0]['time']!=null){
        var maxTime=Date.parse(data[0]['time'].toString()); 
      }
        var truthvalue=parseInt(maxTime)<parseInt(urlTime);
          console.log(truthvalue);
        if(data[0]['time']==null || truthvalue )
       { 
         console.log(historyitem[i]['lastVisitTime']);
        return browser_history.browser_history.create({
          uid: gid,
          url: historyitem[i].url,
          ip:  ip.address(),
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
      
      
      
  }
      )
      .catch(function(err) {
        console.log(err);
    })})(i,historyitem,gid,data);
    resolve("hello");
    });
    let k =await  promise;
    } }
    
    ).catch((err) => {
    console.log(err);
    })
    
  })(historyitem,gid);
}
