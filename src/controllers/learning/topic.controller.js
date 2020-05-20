import {
  Topic, createTopic, deleteTopic, updateATopic,
  getTopics, getTopicById,
} from '../../models/topic';
import { Resource } from '../../models/resource';

export const create = (req, res) => {
  const {
    title, description, milestone_id, program, optional, domain,
  } = req.body;
  createTopic(title, description, milestone_id, program, optional, domain)
    .then((tepTopic) => {
      res.send({
        data: tepTopic,
      });
    })
    .catch(err => console.log(err));
};

export const getAllResourcesByTopic = (req, res) => {
  Resource.findAll({
    attributes: ['url'],
    where: {
      topic_id: req.params.topic_id,
    },
  })
    .then((data) => {
      res.json(data);
    })
    .catch(err => res.status(500).send(err));
};

export const getAllTopics = (req, res) => {
  getTopics()
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getTopic = (req, res) => {
  const { id } = req.params.id;

  getTopicById(id)
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};


export const deleteOne = (req, res) => {
  const { id } = req.params.id;

  deleteTopic(id)
    .then(() => { res.send('Deleted Topic'); })
    .catch(err => res.status(500).send(err));
};

export const updateTopic = (req, res) => {
  const {
    title,
    description,
    program,
    milestone_id,
    optional,
    domain,
  } = req.body;
  updateATopic(
    title,
    description,
    program,
    milestone_id,
    optional,
    domain,
  )
    .then(() => {
      res.send('Topic Updated');
    })
    .catch(err => res.status(500).send(err));
};
