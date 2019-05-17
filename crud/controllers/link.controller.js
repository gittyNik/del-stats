import Resource from '../models/link';
//var resource = require('../models/link')
Links.sync({ force: true }).then(function() {
    return Links.create({
        id: '1',
        topic: 'Express',
        url: "www.google.com"
    });
});

Links.findAll({
    where: {
        id: '1'
    }
}).then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});

/*import getWatsonData from '../util/watsonURL'

export const getAll = (req, res) => {
    Resource.find().exec()
        .then(data => res.json({ data }))
        .catch(err => res.status(500).send(err));
}

export const getOne = (req, res) => {
    Resource.findById(req.params.id).exec()
        .then(data => res.json({ data }))
        .catch(err => res.status(500).send(err));
}

export const create = (req, res) => {
    // console.log("This is links POST")
    console.log(req.body)

    const { text } = req.body;
    console.log(req.body)
    getWatsonData(text)
        .then(d => {
            // console.log(link)
            return new Resource({ data: d, url: text })
                .save()
                .catch(e => { return e })



        })
        .then(data => res.status(200).json({
            "response_type": "in_channel",
            "text": "Thanks for sharing! Your URL has been added",
            "attachments": [{
                "text": text
            }]
        }))
        .catch(err => res.status(500).send(err));
    // .catch(e => console.log(e))

    // console.log(data)

    // const {url} = req.body;
    // new Resource({url, data}).save()
    // 
}

export const update = (req, res) => {
    const { url, data } = req.body
    Resource.findByIdAndUpdate(req.params.id, { type, ttl, tags, data })
        .then(data => res.json({ data }))
        .catch(err => res.status(500).send(err));
}

export const deleteOne = (req, res) => {
    Resource.remove({ _id: req.params.id }).exec()
        .then(() => res.sendStatus(204))
        .catch(err => res.status(500).send(err));
}*/