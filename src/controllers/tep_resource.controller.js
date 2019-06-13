import Resource from '../../models/resource';
import Resource_Comment from '../../models/resource_comment';
import Resource_Report from '../../models/resource_report';
import Resource_Vote from '../../models/resource_vote';
import Sequelize  from 'sequelize';

export const getLatest = (req, res)=> {
  Resource.findAll({
    order: [
      ['add_time', 'DESC'],
    ],
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

/*export const getTop = (req, res)=> {
  Resource.findAll({
    order: [
      ['vote', 'DESC'],
    ],
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const getAllByMilestone = (req,res)=>{
  milestones.findAll({attributes: ['topics'],
      where:{
          id:req.params.milestone_id
      }
  })
  .then((data) => {
      Resource.findAll({attributes: ['url'],
        where:{
          topic_ids :data[0].topics
        }
      }).then((data1)=>{
        res.json(data1);
      })
  })
  .catch(err => res.status(500).send(err));
}

export const getAllByTopic = (req,res)=>{
  Resource.findAll({attributes: ['url'],
      where:{
        topic_ids:req.params.topic_id
      }
  })
  .then((data) => {
      res.json(data);
  })
  .catch(err => res.status(500).send(err));
}
*/
export const getAll = (req,res)=>{
  Resource.findAll({})
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const getOne = (req,res)=>{
  Resource.findAll({
    where:{
        id:req.params.resource_id
    }
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const create = (req, res)=> {
  const data = {
    id:req.body.id,
    topic_id:req.body.topic_id,
    url:req.body.url,
    owner:req.body.owner,
    moderator:req.body.moderator,
    type:req.body.type,
    program:req.body.program,
    add_time:req.body.add_time,
  };
  let {id,topic_id,url,owner,moderator,type,program,add_time} = data;
  Resource.create({
    id,topic_id,url,owner,moderator,type,program,add_time
  })
  .then(()=>res.send("Resource Added"))
  .catch(err=>console.log(err));
}
 
export const update = (req,res)=>{
  Resource.update({url: req.body.url},{
    where: {
      id: req.params.resource_id
    }
  })
.then(() => {res.send('data updated')})
.catch(err => res.status(500).send(err));
}

export const deleteOne = (req,res)=>{
  Resource.destroy({where: {
      id:req.params.resource_id
    }})
    .then(() => {res.send("Deleted");})
    .catch(err => res.status(500).send(err));
}

export const getComments = (req,res)=>{
  Resource_Comment.findAll({
      where:{
          resource_id:req.params.resource_id
      }
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const addComment = (req,res)=>{
  const data={
    resource_id:req.params.resource_id,
    comments: req.body.comments,
  }
  let {resource_id,comments}=data
    return Resource_Comment.create({
      resource_id,comments
    })
    .then(() => res.send("Comment added"))
    .catch(err => res.status(500).send(err));
}

export const deleteComment = (req,res)=>{
  Resource_Comment.destroy({where: {
      id:req.params.comment_id
    }})
    .then(() => {res.send("Comment Deleted");})
    .catch(err => res.status(500).send(err));
}

export const upvote = (req,res)=>{
  Resource_Vote.findOne({
    where: { 
      id:req.params.resource_id
    }
  })
  .then(option => {return option.increment('vote');})
  .catch(err => res.status(500).send(err));
};

export const unvote = (req,res)=>{
  Resource_Vote.findOne({
    where: { 
      id:req.params.resource_id
    }
  })
  .then(option => {return option.decrement('vote');})
  .catch(err => res.status(500).send(err));
}

export const getReports = (req,res)=>{
  Resource_Report.findAll({})
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const addReport = (req,res)=>{
  const data={
    resource_id:req.params.resource_id,
    report: req.body.report,
  }
  let {resource_id,report} = data
  return Resource_Report.create({
    resource_id,report
  })
  .then(() => res.send("Report Inserted"))
  .catch(err => res.status(500).send(err));
}

export const resolveReport = (req,res)=>{
  Resource_Report.update({
  status: 'resolved'
}, {
    where: {
    id: req.params.report_id
    }
  })
  .then(() => {res.send('Updated');})
  .catch(err => res.status(500).send(err));
}

export const getUnmoderated = (req, res)=> {
    Resource.findAll({
        where: {
            moderator: null
        }
    })
    .then((data) => {res.json(data);})
    .catch(err => res.status(500).send(err));
}

export const approve = (req,res)=>{
    Resource.update({
    moderator: Sequelize.UUIDV1
  }, {
    where: {
      id: req.params.resource_id
    }
  })
  .then(() => {res.send('Resource approved');})
  .catch(err => res.status(500).send(err));
}