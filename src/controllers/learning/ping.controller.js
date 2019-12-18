import { uuid } from 'uuid/v4';
import { Ping } from '../../models/ping';

export const getAllPings = (req, res) => {
  Ping.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const createPing = (req, res) => {
  const {
    ping_template_id,
    type,
    trigger,
    educator_id,
    recipiens,
    status,
    time_scheduled,
  } = req.body;
  Ping.create({
    id: uuid(),
    ping_template_id,
    type,
    trigger,
    educator_id,
    recipiens,
    status,
    time_scheduled,
  })
    .then(() => res.send('Ping Created.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updatePing = (req, res) => {
  const { id } = req.params;
  const {
    ping_template_id,
    type,
    trigger,
    educator_id,
    recipiens,
    status,
    time_scheduled,
  } = req.body;
  Ping.update({
    ping_template_id,
    type,
    trigger,
    educator_id,
    recipiens,
    status,
    time_scheduled,
  }, {
    where: { id },
  })
    .then(() => res.send('Ping Updated.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const deletePing = (req, res) => {
  const { id } = req.params;
  Ping.destroy({
    where: { id },
  })
    .then(() => res.send('Ping Deleted.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};
