import Resource from '../models/prompt';

export const getAll = (req, res) => {
  Resource.find().exec()
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const getOne = (req, res) => {
  Resource.findById(req.params.id).exec()
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const create = (req, res) => {
  console.log("In create Prompt")
  const {name, duration, pings, type} = req.body;
  console.log(req);
  new Resource({name, duration, pings, type}).save()
  .then(data => res.status(201).json({data}))
  .catch(err => {
    console.log(err)
    res.status(500).send(err)});
}

export const update = (req, res) => {
  const { name, type, duration, pings, tags } = req.body;
  Resource.findByIdAndUpdate(req.params.id, { name, type, duration, pings, tags })
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const deleteOne = (req, res) => {
  Resource.remove({_id:req.params.id}).exec()
  .then(() => res.sendStatus(204))
  .catch(err => res.sendStatus(500).send(err));
}
