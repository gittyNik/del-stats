import { v4 as uuid } from 'uuid';
import { PingTemplate } from '../../models/ping_template';

export const getAllPingTemplates = (req, res) => {
  PingTemplate.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const createPingTemplate = (req, res) => {
  const {
    text,
    details,
    author_id,
    response_format,
    domain,
    tags,
  } = req.body;
  PingTemplate.create({
    id: uuid(),
    text,
    details,
    author_id,
    response_format,
    domain,
    tags,
  })
    .then(() => res.send('PingTemplate Created.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updatePingTemplate = (req, res) => {
  const { id } = req.params;
  const {
    text,
    details,
    author_id,
    response_format,
    domain,
    tags,
  } = req.body;
  PingTemplate.update({
    text,
    details,
    author_id,
    response_format,
    domain,
    tags,
  }, {
    where: { id },
  })
    .then(() => res.send('PingTemplate Updated.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const deletePingTemplate = (req, res) => {
  const { id } = req.params;
  PingTemplate.destroy({
    where: { id },
  })
    .then(() => res.send('PingTemplate Deleted.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};
