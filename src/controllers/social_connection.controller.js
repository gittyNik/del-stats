import { SocialConnection, PROVIDERS } from '../models/social_connection';

export const getAll = (req, res) => {
  SocialConnection.findAll()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getOne = (req, res) => {
  SocialConnection.findByPk(req.params.id)
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const create = (req, res) => {
  console.log('In create Prompt');
  const {
    name, duration, pings, type,
  } = req.body;
  console.log(req);
  SocialConnection.create({
    name, duration, pings, type,
  })
    .then(data => res.status(201).json({ data }))
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const update = (req, res) => {
  const {
    name, type, duration, pings, tags,
  } = req.body;
  SocialConnection.update(req.params.id, {
    name, type, duration, pings, tags,
  })
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const deleteOne = (req, res) => {
  SocialConnection.destroy({ _id: req.params.id })
    .then(() => res.sendStatus(204))
    .catch(err => res.sendStatus(500).send(err));
};
