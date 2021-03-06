import { v4 as uuid } from 'uuid';
import { Pong } from '../../models/pong';
import logger from '../../util/logger';

export const getPongs = (req, res) => {
  Pong.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const createPong = (req, res) => {
  const {
    ping_id,
    learner_id,
    response,
  } = req.body;

  Pong.create({
    id: uuid(),
    ping_id,
    learner_id,
    response,
  })
    .then(() => res.send('Pong created'))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const updatePong = (req, res) => {
  const { id } = req.params;
  const {
    ping_id,
    learner_id,
    response,
  } = req.body;
  Pong.update({
    ping_id,
    learner_id,
    response,
  }, {
    where: { id },
  })
    .then(() => res.send('Pong Updated'))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const deletePong = (req, res) => {
  const { id } = req.params;
  Pong.destroy({
    where: { id },
  })
    .then(() => res.send('Pong Deleted'))
    .catch(err => {
      logger.error(err);
      res.send(500);
    });
};
