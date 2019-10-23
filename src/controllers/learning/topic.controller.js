import uuid from 'uuid/v4';
import Topic from '../../models/topic';
import Resource from '../../models/resource';

export const create = (req, res) => {
  const { title, description, milestone_id } = req.body;
  Topic.create({
    id: uuid(),
    program: 'tep',
    title,
    description,
    milestone_id,
  })
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
