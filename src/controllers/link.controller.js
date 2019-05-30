const Resource=require('../models/link')

export const insert = (req, res)=> {
    Resource.sync({ force: false })
    .then(()=> {
        return Resource.create({
            uid: req.params.uid,
            topic: req.params.topic,
            url: req.params.url
        })
    })
    .catch(err => res.status(500).send(err));    
}

export const select = (req, res)=> {
    Resource.findAll({
        where: {
            topic: req.params.topic
        }
    })
    .then((data) => {res.json(data);})
    .catch(err => res.status(500).send(err));
}