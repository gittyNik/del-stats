import { v4 as uuid } from 'uuid';
import { Program } from '../../models/program';

export const getPrograms = (req, res) => {
  Program.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const getProgram = (req, res) => {
  const { id } = req.params;
  Program.findAll({
    where: { id },
  })
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const createProgram = (req, res) => {
  const {
    name, location, milestones, duration,
    test_series, milestone_review_rubric,
  } = req.body;
  Program.create({
    id: uuid(),
    name,
    location,
    milestones,
    duration,
    test_series,
    milestone_review_rubric,
  })
    .then(data => res.json(data))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updateProgram = (req, res) => {
  const { id } = req.params;
  const {
    name, location, milestones, duration,
    test_series, milestone_review_rubric,
  } = req.body;
  Program.update({
    name,
    location,
    milestones,
    duration,
    test_series,
    milestone_review_rubric,
  }, { where: { id } })
    .then(() => res.send('Program Successfully updated'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const deleteProgram = (req, res) => {
  const { id } = req.params;
  Program.destroy({
    where: { id },
  })
    .then(() => res.send('Program Deleted.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500).send('Unable to Delete Program.');
    });
};
