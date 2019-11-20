import Resource from '../../models/ping';

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
  const {
    type, ttl, tags, data,
  } = req.body;
  new Resource({
    type, ttl, tags, data,
  }).save()
    .then(ping => res.status(201).json({ ping }))
    .catch(err => res.status(500).send(err));
};

export const update = (req, res) => {
  const {
    type, ttl, tags, data,
  } = req.body;
  Resource.findByIdAndUpdate(req.params.id, {
    type, ttl, tags, data,
  })
    .then(ping => res.json({ ping }))
    .catch(err => res.status(500).send(err));
};

export const deleteOne = (req, res) => {
  Resource.remove({ _id: req.params.id }).exec()
    .then(() => res.sendStatus(204))
    .catch(err => res.status(500).send(err));
};
