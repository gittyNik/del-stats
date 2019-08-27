/*
  This is a simple resource controller. Customize this!!
  import Resource from '../models/resource';
*/
const Resource = require(`../models/${require('path').basename(__filename).split('.')[0]}`);

export const getAll = (req, res) => {
  Resource.find().exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getOne = (req, res) => {
  Resource.findById(req.params.id).exec()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const create = (req, res) => {
  const { data } = req.body;
  new Resource({ data }).save()
    .then(data => res.status(201).json({ data }))
    .catch(err => res.status(500).send(err));
};

export const update = (req, res) => {
  Resource.findByIdAndUpdate(req.params.id)
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const deleteOne = (req, res) => {
  Resource.remove({ id: req.params.id }).exec()
    .then(() => res.status(204))
    .catch(err => res.status(500).send(err));
};
