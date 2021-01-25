import { v4 as uuid } from 'uuid';
import { SocialConnection, getGithubConnecionByUserId } from '../../models/social_connection';
import logger from '../../util/logger';

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
  // logger.info('In create Prompt');
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
      logger.error(err);
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

// Quick fix to add or update linkedin Profile for a learner
export const createOrUpdateLinkedinConnection = async (req, res) => {
  const {
    id: user_id, username, email,
  } = req.body;
  await SocialConnection
    .findOne({
      where: {
        user_id,
        provider: 'linkedin',
      },
    })
    .then(data => {
      if (data) {
        return SocialConnection.update({
          username,
        }, {
          where: {
            user_id,
            provider: 'linkedin',
          },
          raw: true,
          returning: true,
        })
          .then(data1 => res.json({
            text: 'Updated linkedin Social connection',
            data: data1,

          }));
      }
      return SocialConnection.create({
        id: uuid(),
        user_id,
        provider: 'linkedin',
        username,
        email,
      }).then(data1 => res.json({
        text: 'Created a linkedin social connection',
        data: data1,
        type: 'success',
      }));
    })
    .catch(err => {
      logger.error(err);
      res.status(500).json({
        text: 'Failed to create or update linkedin',
        type: 'failure',
      });
    });
};
