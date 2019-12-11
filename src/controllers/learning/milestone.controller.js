import uuid from 'uuid/v4';
import { Topic } from '../../models/topic';
import { Team } from '../../models/team';
import { Resource } from '../../models/resource';
import { Milestone } from '../../models/milestone';

export const getAllMilestones = (req, res) => {
  Milestone.findAll({})
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const getMilestone = (req, res) => {
  Milestone.findAll({
    where: {
      id: req.params.milestone_id,
    },
  })
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const create = (req, res) => {
  const { name, topics } = req.body;
  Milestone.create({
    id: uuid(),
    name,
    topics,
  })
    .then((tepMilestone) => {
      res.send({
        data: tepMilestone,
      });
    })
    .catch(err => console.log(err));
};

export const update = (req, res) => {
  Milestone.update({ name: req.body.milestone_name }, {
    where: {
      id: req.params.milestone_id,
    },
  })
    .then(() => {
      res.send('Milestone updated');
    })
    .catch(err => res.status(500).send(err));
};

export const deleteOne = (req, res) => {
  Milestone.destroy({
    where: {
      id: req.params.milestone_id,
    },
  })
    .then(() => { res.send('Deleted milestone'); })
    .catch(err => res.status(500).send(err));
};

export const getAllByMilestone = (req, res) => {
  Topic.findAll({
    attributes: ['id'],
    where: {
      milestone_id: req.params.milestone_id,
    },
  })
    .then((data) => {
      Resource.findAll({
        attributes: ['url'],
        where: {
          topic_id: data[0].id,
        },
      })
        .then((data1) => {
          res.json(data1);
        });
    })
    .catch(err => res.status(500).send(err));
};

export const getTeam = (req, res) => {
  Team.findAll({
    where: {
      id: req.params.team_id,
    },
  })
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createTeam = (req, res) => {
  const { name } = req.body;
  Team.create({
    id: uuid(),
    name,
  })
    .then((team) => {
      res.send({
        data: team,
      });
    })
    .catch(err => console.log(err));
};

export const updateTeam = (req, res) => {
  Team.update({ name: req.body.team_name }, {
    where: {
      id: req.params.team_id,
    },
  })
    .then(() => {
      res.send('Team updated');
    })
    .catch(err => res.status(500).send(err));
};

export const deleteTeam = (req, res) => {
  Team.destroy({
    where: {
      id: req.params.team_id,
    },
  })
    .then(() => { res.send('Deleted team'); })
    .catch(err => res.status(500).send(err));
};

export const getMilestoneTeams = (req, res) => {
  Team.findAll({
    where: {
      cohort_milestone_id: req.params.milestone_id,
    },
  })
    .then((data) => { res.json(data); })
    .catch(err => res.status(500).send(err));
};

export const createMilestone = (req, res) => {
  const {
    name, prerequisite_milestones,
    learning_competencies, guidelines, problem_statement,
  } = req.body;

  Milestone.create({
    id: uuid(),
    name,
    prerequisite_milestones,
    problem_statement,
    learning_competencies,
    guidelines,
  })
    .then((data) => { res.json(data); })
    .catch(err => console.log(err));
};

export const updateMilestone = (req, res) => {
  const {
    name, prerequisite_milestones,
    learning_competencies, guidelines, problem_statement,
  } = req.body;

  Milestone.update({
    name,
    prerequisite_milestones,
    problem_statement,
    learning_competencies,
    guidelines,
  }, {
    where: { id: req.params.id },
  })
    .then(() => { res.send('Milestone Updated'); })
    .catch(err => console.log(err));
};

export const deleteMilestone = (req, res) => {
  Milestone.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then(() => { res.send('Deleted milestone '); })
    .catch(err => res.status(500).send(err));
};
