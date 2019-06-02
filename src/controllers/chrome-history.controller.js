var Resource=require('../models/chrome-history')

export const getAll= function(req,res){Resource.links.findAll({}).then((data) => {
    res.json(data)
  }).catch((err) => {
    console.log(err);
  })
}
export const getOne= function(req,res){Resource.links.findAll({ where: {
  uid: req.params.id
} }).then((data) => {
  res.json(data)
}).catch((err) => {
  console.log(err);
})
}


export const getMax= function(req,res){
  var sequelize=require('sequelize')
  Resource.links.findAll({ 

  attributes: [[sequelize.fn('max', sequelize.col('visited_timestamp')), 'time']],
  raw: true,
 }).then((data) => {
  res.json(data)
}).catch((err) => {
  console.log(err);
})
}
 //module.exports={"getOne":getOne,"getAll":getAll,"getMax":getMax}