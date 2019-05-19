var Resource=require('../models/link')
//var hist=require('../typedUrls')
var insert=function(req,res){ Resource.links.sync({force: false}).then(function () {
  return Resource.links.create({
    uid: req.params.id,
    url: ['www.google.com','www.facebook.com']
  });
});
res.send('inserted data'); 
}

var getAll= function(req,res){Resource.links.findAll({}).then((data) => {
    res.json(data)
  }).catch((err) => {
    console.log(err);
  })
}
var getOne= function(req,res){Resource.links.findAll({ where: {
  uid: req.params.id
} }).then((data) => {
  res.json(data)
}).catch((err) => {
  console.log(err);
})
}
 module.exports={"getOne":getOne,"getAll":getAll ,"insert":insert}