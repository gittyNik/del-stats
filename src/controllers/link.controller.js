import imageThumbnail from 'image-thumbnail';
import {links,thumbnails} from '../models/link';

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

export const insertImage = (req,res)=> { 
    let options = { responseType: 'base64' }
    imageThumbnail(req.file.path,options)
    .then((thumbnail) => {     
        thumbnails.sync({ force: false })
        .then(()=> {
        return thumbnails.create({
                uid: req.params.uid,
                topic: req.params.topic,
                thumbnail: thumbnail
            })
        })
    })
    .catch(err => res.status(500).send(err));
};