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
  Resource.sync({ force: false })
  .then(()=> {
    return Resource.create({
        topic_id:Sequelize.UUIDV1,
        url:"www.google.com",
        owner:Sequelize.UUIDV1,
        moderator:Sequelize.UUIDV4,
        type:"article",
        program:"xyz",
        add_time:'2016-06-22 19:10:25-07'
    })
  })
    .then(()=>{res.send("Successfully posted url");})
    .catch(err => res.status(500).send(err));
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
  Resource_Comment.sync({ force: false })
  .then(()=> {
      return Resource_Comment.create({
          resource_id:req.params.resource_id,
          comments: /*req.body.comment,*/"asdsfsd",
      })
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
  Resource_Report.sync({ force: false })
  .then(()=> {
      return Resource_Report.create({
          resource_id:req.params.resource_id,
          report: req.body.report,
      })
  })
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
