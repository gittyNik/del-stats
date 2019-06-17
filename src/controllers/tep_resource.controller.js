import Resource from '../../models/resource';
import Resource_Comment from '../../models/resource_comment';
import Resource_Report from '../../models/resource_report';
import Resource_Vote from '../../models/resource_vote';
import Milestones from '../../models/milestone';
import sequelize  from 'sequelize';
import uuid from 'uuid/v4';

export const getLatest = (req, res)=> {
  Resource.findAll({
    order: [
      ['add_time', 'DESC'],
    ],
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const getTop = (req, res)=> {
  Resource_Vote.findAll({
    attributes: ['resource_id', [sequelize.fn('count', sequelize.col('resource_id')), 'count']],
      group : ['resource_votes.resource_id'],
      raw: true,
      order: sequelize.literal('count DESC')
    })
    .then((data1)=>{
      Resource.findAll({attributes:['url'],
        where:{
            id:data1[0]['resource_id']
        }
      })
      .then((data) => {
        res.json(data);
      });
    })
    .catch(err => res.status(500).send(err));
}


export const getAllByMilestone = (req,res)=>{
  Milestones.findAll({attributes: ['topics'],
      where:{
          id:req.params.milestone_id
      }
  })
  .then((data) => {
      Resource.findAll({attributes: ['url'],
        where:{
          topic_id :data[0].topics
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
        topic_id:req.params.topic_id
      }
  })
  .then((data) => {
      res.json(data);
  })
  .catch(err => res.status(500).send(err));
}

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
  let {topic_id, url, type, level} = req.body;
  console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&7')
  console.log(level)
  Resource.create({
    id: uuid(),
    owner: uuid(),       // todo: Add the user's id here after auth is set
    moderator: uuid(),
    program: 'tep',
    add_time: Date.now(),
    topic_id,
    url,
    type,
    level,
  })
  .then(tepResource => {
    res.send({
      data: tepResource
    });
  })
  .catch(err=>console.log(err));
}
 
export const update = (req,res)=>{
  Resource.update({url: req.body.url},{
    where: {
      id: req.params.resource_id
    }
  })
.then(() => {res.send('Resource updated')})
.catch(err => res.status(500).send(err));
}

export const deleteOne = (req,res)=>{
  Resource.destroy({where: {
      id:req.params.resource_id
    }})
    .then(() => {res.send("Deleted resource");})
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
    }
  })
  .then(() => {res.send("Comment Deleted");})
  .catch(err => res.status(500).send(err));
}

export const upvote = (req,res)=>{
  const data={
    user_id : req.body.user_id,
    resource_id : req.params.resource_id,
    vote : "upvote"
  }
  let {user_id,resource_id,vote} = data
  return Resource_Vote.create({user_id,resource_id,vote})
  .then(() => res.send("Vote added"))
  .catch(err => res.status(500).send(err));
};

export const unvote = (req,res)=>{
  Resource_Vote.destroy({
    where: { 
      resource_id : req.params.resource_id,
      user_id : req.body.user_id
    }
  })
  .then(() => res.send("Vote deleted"))
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
    moderator: req.body.id
  }, {
    where: {
      id: req.params.resource_id
    }
  })
  .then(() => {res.send('Resource approved');})
  .catch(err => res.status(500).send(err));
}