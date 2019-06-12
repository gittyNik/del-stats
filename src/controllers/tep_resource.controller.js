import Resource from '../../models/resource';

export const getLatest = (req, res)=> {
  Resource.findAll({
    order: [
      ['createdAt', 'DESC'],
    ],
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const getTop = (req, res)=> {
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
        uid : req.body.uid,
        topic:req.body.topic,
        url: req.body.url,
    })
})
  .catch(err => res.status(500).send(err));
}

export const update = (req,res)=>{
  Resource.update({url: req.body.url},{
    where: {
      id: req.params.resource_id
    }
  })
.then(() => {console.log('data updated')})
.catch(err => res.status(500).send(err));
}

export const delete = (req,res)=>{
  Resource.destroy({where: {
      id:req.params.resource_id
    }})
    .then(() => {console.log("Deleted");})
    .catch(err => res.status(500).send(err));
}

export const getComments = (req,res)=>{
  resource_comments.findAll({
      where:{
          resource_id:req.params.resource_id
      }
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const addComment = (req,res)=>{
  resource_comments.sync({ force: false })
  .then(()=> {
      return resource_comments.create({
          resource_id:req.params.resource_id,
          comments: req.body.comment,
      })
  })
  .catch(err => res.status(500).send(err));
}

export const deleteComment = (req,res)=>{
  resource_comments.destroy({where: {
      id:req.params.comment_id
    }})
    .then(() => {console.log("comment Deleted");})
    .catch(err => res.status(500).send(err));
}

export const upvote = (req,res)=>{
  Resource.findOne({
    where: { 
      id:req.params.resource_id
    }
  })
  .then(option => {return option.increment('vote');})
  .catch(err => res.status(500).send(err));
};

export const unvote = (req,res)=>{
  Resource.findOne({
    where: { 
      id:req.params.resource_id
    }
  })
  .then(option => {return option.decrement('vote');})
  .catch(err => res.status(500).send(err));
}

export const getReports = (req,res)=>{
  resource_reports.findAll({})
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const addReport = (req,res)=>{
  resource_reports.sync({ force: false })
  .then(()=> {
      return resource_reports.create({
          resource_id:req.params.resource_id,
          report: req.body.report,
      })
  })
  .catch(err => res.status(500).send(err));
}

export const resolveReport = (req,res)=>{
  resource_reports.update({
  status: 'resolved'
}, {
    where: {
    id: req.params.report_id
    }
  })
  .then(() => {console.log('Updated');})
  .catch(err => res.status(500).send(err));
}
export const getAllUnmoderated = (req, res)=> {
    Resource.findAll({
        where: {
            status: 'pending'
        }
    })
    .then((data) => {res.json(data);})
    .catch(err => res.status(500).send(err));
}

export const approve = (req,res)=>{
    Resource.update({
    status: 'approved'
  }, {
    where: {
      id: req.params.resource_id
    }
  }).then(() => {
    console.log('Updated');
  }).catch((e) => {
    console.log("Error"+e);
  })
}
