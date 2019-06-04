import {links} from '../models/link';

export const insert = (req, res)=> {
    links.sync({ force: false })
    .then(()=> {
        return links.create({
            uid: req.params.uid,
            topic: req.params.topic,
            url: req.params.url
        })
    })
    .catch(err => res.status(500).send(err));    
}

export const select = (req, res)=> {
    links.findAll({
        where: {
            topic: req.params.topic
        }
    })
    .then((data) => {res.json(data);})
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

export const retrieve_report=(req,res)=>{
    resource_reports.findAll({})
    .then((data) => {res.json(data);})
    .catch(err => res.status(500).send(err));
}

export const update_report=(req,res)=>{
    resource_reports.update({
    status: 'resolved'
  }, {
    where: {
      id: req.params.report_id
    }
  }).then(() => {
    console.log('Updated');
  }).catch((e) => {
    console.log("Error"+e);
  })
}