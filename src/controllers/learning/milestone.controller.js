import uuid from 'uuid/v4';
import { Topic } from '../../models/topic';
import { deleteMilestoneTeams, createMilestoneTeams, Team } from '../../models/team';
import { Resource } from '../../models/resource';
import {
  Milestone,
  createMilestones,
  updateMilestones,
  deleteMilestones,
} from '../../models/milestone';

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
    .catch(err => console.error(err));
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
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const getTeam = (req, res) => {
  Team.findAll({
    where: {
      id: req.params.team_id,
    },
  })
    .then((data) => { res.json(data); })
    .catch(err => {
      console.error(err);
      res.status(500);
    });
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
    .catch(err => console.error(err));
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

export const generateMilestoneTeams = (req, res) => {
  const { milestone_id } = req.params;
  createMilestoneTeams(milestone_id)
    .then(data => {
      res.send({
        text: 'Milestone Team',
        data,
      });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const getMilestoneTeams = (req, res) => {
  Team.findAll({
    where: {
      cohort_milestone_id: req.params.milestone_id,
    },
  })
    .then((data) => { res.json(data); })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const resetMilestoneTeams = (req, res) => {
  const { milestone_id } = req.params;
  deleteMilestoneTeams(milestone_id)
    .then(() => createMilestoneTeams(milestone_id))
    .then(data => {
      res.send({ data });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const createMilestone = (req, res) => {
  const {
    name, prerequisite_milestones,
    problem_statement, learning_competencies, releases, starter_repo,
    alias, duration,
  } = req.body;
  const { id } = req.jwtData.user;
  let updated_by = [id];

  createMilestones(name, prerequisite_milestones,
    problem_statement, learning_competencies, releases, starter_repo,
    alias, duration, updated_by)
    .then((data) => { res.json(data); })
    .catch(err => console.error(err));
};

export const updateMilestone = (req, res) => {
  const {
    name, prerequisite_milestones, starter_repo,
    learning_competencies, releases, guidelines, problem_statement,
    alias, duration,
  } = req.body;
  const user_id = req.jwtData.user.id;
  const { id } = req.params;

  updateMilestones(id,
    name, problem_statement, starter_repo, user_id,
    releases, learning_competencies, prerequisite_milestones, guidelines,
    alias, duration)
    .then(() => { res.send('Milestone Updated'); })
    .catch(err => console.error(err));
};

export const deleteMilestone = (req, res) => {
  deleteMilestones().then(() => { res.send('Deleted milestone '); })
    .catch(err => res.status(500).send(err));
};
