import { v4 as uuid } from 'uuid';
import {
  Tags, getResourcesByTag, getTagIdbyName, getTagIdbyNames,
} from '../../models/tags';
import logger from '../../util/logger';

export const getTags = (req, res) => {
  Tags.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const getTag = (req, res) => {
  const { id } = req.params;
  Tags.findOne({
    where: { id },
  })
    .then(data => res.json(data))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const getTagIdName = (req, res) => {
  const { tag_name } = req.params;
  getTagIdbyName(tag_name)
    .then(data => {
      // logger.info(data);
      res.send({ data });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

export const getTagIdNames = (req, res) => {
  const { tag_name } = req.body;
  getTagIdbyNames(tag_name)
    .then(data => {
      // logger.info(data);
      res.send({ data });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

export const createTags = (req, res) => {
  const {
    tag_name, add_time, topic_id,
    owner, moderator, description,
    source, details, parent_tags,
    child_tags, similar_tags,
  } = req.body;

  Tags.create({
    id: uuid(),
    topic_id,
    tag_name,
    add_time,
    owner,
    moderator,
    description,
    source,
    details,
    parent_tags,
    child_tags,
    similar_tags,
  })
    .then(data => {
      // logger.info(data);
      res.send('Tag created');
    })
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const updateTags = (req, res) => {
  const {
    tag_name,
    add_time,
    owner,
    moderator,
    description,
    source,
    details,
    parent_tags,
    child_tags,
    similar_tags,
  } = req.body;
  const { id } = req.params;

  Tags.update({
    tag_name,
    add_time,
    owner,
    moderator,
    description,
    source,
    details,
    parent_tags,
    child_tags,
    similar_tags,
  }, {
    where: { id },
  })
    .then(() => res.send('Tags updated.'))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};

export const deleteTags = (req, res) => {
  const { id } = req.params;

  Tags.destroy({
    where: { id },
  })
    .then(() => res.send('Deleted Tag. '))
    .catch(err => {
      logger.error(err);
      res.status(500);
    });
};
