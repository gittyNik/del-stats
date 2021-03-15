import {
  createTopic, deleteTopic, updateATopic,
  getTopics, getTopicById,
} from '../../models/topic';
import {
  getLiveCohortMilestoneBylearnerId,
} from '../../models/cohort_milestone';
import { Resource } from '../../models/resource';

export const create = (req, res) => {
  const {
    title, description, milestone_id, program, optional, domain,
    path,
  } = req.body;
  createTopic(title, description, milestone_id, program, optional, domain, path)
    .then((tepTopic) => {
      res.send({
        data: tepTopic,
      });
    })
    .catch(err => console.error(err));
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

export const getAllTopics = async (req, res) => {
  const user_id = req.jwtData.user.id;
  const { for_user } = req.query;
  let program;
  let cohort;
  if (for_user) {
    cohort = await getLiveCohortMilestoneBylearnerId(user_id);
    if ('cohort.program_id' in cohort) {
      program = cohort['cohort.program_id'];
    } else {
      program = 'tep';
    }
  } else {
    program = null;
  }
  getTopics(program)
    .then((data) => {
      const response = {
        topics: data,
        message: 'Topics fetched successfully',
        type: 'success',
      };
      if (cohort && 'milestone.id' in cohort) {
        response.milestone_id = cohort['milestone.id'];
      }
      res.json(response);
    })
    .catch(err => {
      console.error(`Error while fetching topics: ${err}`);
      res.status(500);
    });
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
    path,
  } = req.body;
  updateATopic(
    title,
    description,
    program,
    milestone_id,
    optional,
    domain,
    path,
  )
    .then(() => {
      res.send('Topic Updated');
    })
    .catch(err => res.status(500).send(err));
};
