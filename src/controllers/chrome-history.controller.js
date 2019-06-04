import {links} from '../models/chrome-history';

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
    raw: true,
  }).then((data) => {
    res.json(data)
  }).catch((err) => {
  console.log(err);
  })
}
