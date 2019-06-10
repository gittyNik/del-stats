import {links} from '../models/chrome-history';
var localStorage=require('localStorage');
var ip=require('ip');
export const getAll= function(req,res){links.findAll({}).then((data) => {
    res.json(data)
  }).catch((err) => {
    console.log(err);
  })
}

export const getOne= function(req,res){links.findAll({ 
  where: {
        uid: req.params.id
    } 
  }).then((data) => {res.json(data)})
  .catch((err) => {console.log(err);})
}

export const getMax= (req,res)=>{
  var sequelize=require('sequelize');
  links.findAll({ 
    attributes: [[sequelize.fn('max', sequelize.col('visited_timestamp')), 'time']],
    where:{
      user_id:localStorage.getItem('userId')
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
  console.log("welcome");
  console.log(localStorage.getItem('userId'));
  console.log(historyitem);
  var Resource=require('../models/chrome-history');     
  ( function(historyitem,gid){
      var sequelize=require('sequelize');
       Resource.links.findAll({ 
      attributes: [[sequelize.fn('max', sequelize.col('visited_timestamp')), 'time']],
      where:{
        user_id:gid
      },
      raw: true,
    }).then( async (data) => {
      for(var i=0;i<historyitem.length;i++){
         var promise=new Promise((resolve,reject)=>{(function(i,historyitem,gid,data){Resource.links.sync({force: false}).then(function () {
        if(data[0]['time']==null || data[0]['time']<historyitem[i]['lastVisitTime'])
       { 
         console.log("right");
         console.log(historyitem[i]['lastVisitTime']);
        return Resource.links.create({
          user_id: gid,
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
        console.log(historyitem[i]['lastVisitTime']);
        console.log(data[0]['time']);
        console.log("wrong");
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
    console.log("hero");
    } }
    
    ).catch((err) => {
    console.log(err);
    })
    
    
    
  })(historyitem,gid);
}