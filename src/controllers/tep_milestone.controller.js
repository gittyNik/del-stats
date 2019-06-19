import uuid from 'uuid/v4';
<<<<<<< HEAD
import Topic from '../models/topic';
import Resource from '../models/resource'
import Milestone from '../models/milestone';
=======
import Topic from '../../models/topic';
import Resource from '../../models/resource'
import Milestone from '../../models/milestone';
>>>>>>> Changed the db structure of milestone and updated respective routes

export const create = (req, res)=> {
  let {name, topics} = req.body;
  Milestone.create({
    id: uuid(),
    name,
    topics
  })
  .then(tepMilestone => {
    res.send({
      data: tepMilestone
    });
  })
  .catch(err=>console.log(err));
}

export const getAllByMilestone = (req,res)=>{
  Topic.findAll({attributes: ['id'],
    where:{
      milestone_id:req.params.milestone_id
    }
  })
  .then((data) => {
    Resource.findAll({attributes: ['url'],
      where:{
        topic_id :data[0].id
      }
    })
    .then((data1)=>{
      res.json(data1);
    })
  })
  .catch(err => res.status(500).send(err));
}
