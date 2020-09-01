import uuid from 'uuid/v4';
import { SocialConnection, getGithubConnecionByUserId } from '../../models/social_connection';

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
  // console.log('In create Prompt');
  const {
    provider, username, email,
    profile,
    access_token,
    expiry,
  } = req.body;
  const { id } = req.jwtData.user;
  SocialConnection.create({
    id: uuid(),
    user_id: id,
    provider,
    username,
    email,
    profile,
    access_token,
    expiry,
  })
    .then(data => res.status(201).json({ data }))
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
};

export const update = (req, res) => {
  const {
    provider, username, email,
    profile,
    access_token,
    expiry,
  } = req.body;
  const { id } = req.jwtData.user;
  SocialConnection.update(req.params.id, {
    provider,
    username,
    email,
    profile,
    access_token,
    expiry,
  })
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const deleteOne = (req, res) => {
  SocialConnection.destroy({ _id: req.params.id })
    .then(() => res.sendStatus(204))
    .catch(err => res.status(500).send(err));
};

export const getGithubConnection = (req, res) => {
  getGithubConnecionByUserId(req.params.id)
    .then(data => {
      if (!data) {
        res.sendStatus(404);
      } else {
        res.json({
          text: 'Github Social Connection',
          data,
        });
      }
    })
    .catch(err => res.status(500).send(err));
};
