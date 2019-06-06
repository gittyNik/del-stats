import {links} from '../models/link';

export const get_latest=(req, res)=> {
  links.findAll({
    order: [
      ['createdAt', 'DESC'],
    ],
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const get_top=(req, res)=> {
  links.findAll({
    order: [
      ['vote', 'DESC'],
    ],
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const get_milestone_resources=(req,res)=>{
  milestones.findAll({attributes: ['topics'],
      where:{
          id:req.params.milestone_id
      }
  })
  .then((data) => {
      links.findAll({attributes: ['url'],
        where:{
          topic_ids :data[0].topics
        }
      }).then((data1)=>{
        res.json(data1);
      })
  })
  .catch(err => res.status(500).send(err));
}

export const get_topic_resources=(req,res)=>{
  links.findAll({attributes: ['url'],
      where:{
        topic_ids:req.params.topic_id
      }
  })
  .then((data) => {
      res.json(data);
  })
  .catch(err => res.status(500).send(err));
}

export const get_resources=(req,res)=>{
  links.findAll({})
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const get_resource=(req,res)=>{
  links.findAll({
    where:{
        id:req.params.resource_id
    }
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const insert_resource = (req, res)=> {
  links.sync({ force: false })
  .then(()=> {
    return links.create({
        uid : req.body.uid,
        topic:req.body.topic,
        url: req.body.url,
    })
})
  .catch(err => res.status(500).send(err));
}

export const update_resource=(req,res)=>{
  links.update({url: req.body.url},{
    where: {
      id: req.params.resource_id
    }
  })
.then(() => {console.log('data updated')})
.catch(err => res.status(500).send(err));
}

export const delete_resource=(req,res)=>{
  links.destroy({where: {
      id:req.params.resource_id
    }})
    .then(() => {console.log("Deleted");})
    .catch(err => res.status(500).send(err));
}

export const get_comments=(req,res)=>{
  resource_comments.findAll({
      where:{
          resource_id:req.params.resource_id
      }
  })
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const insert_comment=(req,res)=>{
  resource_comments.sync({ force: false })
  .then(()=> {
      return resource_comments.create({
          resource_id:req.params.resource_id,
          comments: req.body.comment,
      })
  })
  .catch(err => res.status(500).send(err));
}

export const delete_comment=(req,res)=>{
  resource_comments.destroy({where: {
      id:req.params.comment_id
    }})
    .then(() => {console.log("comment Deleted");})
    .catch(err => res.status(500).send(err));
}

export const upvote=(req,res)=>{
  links.findOne({
    where: { 
      id:req.params.resource_id
    }
  })
  .then(option => {return option.increment('vote');})
  .catch(err => res.status(500).send(err));
};

export const downvote=(req,res)=>{
  links.findOne({
    where: { 
      id:req.params.resource_id
    }
  })
  .then(option => {return option.decrement('vote');})
  .catch(err => res.status(500).send(err));
}

export const get_report=(req,res)=>{
  resource_reports.findAll({})
  .then((data) => {res.json(data);})
  .catch(err => res.status(500).send(err));
}

export const insert_report=(req,res)=>{
  resource_reports.sync({ force: false })
  .then(()=> {
      return resource_reports.create({
          resource_id:req.params.resource_id,
          report: req.body.report,
      })
  })
  .catch(err => res.status(500).send(err));
}

export const update_report=(req,res)=>{
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
export const unmoderated_requests = (req, res)=> {
    links.findAll({
        where: {
            status: 'pending'
        }
    })
    .then((data) => {res.json(data);})
    .catch(err => res.status(500).send(err));
}

export const approve_resource=(req,res)=>{
    links.update({
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
