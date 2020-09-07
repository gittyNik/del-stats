import uuid from 'uuid/v4';
import { Portfolio } from '../../models/portfolio';

export const getAllPortfolios = (req, res) => {
  Portfolio.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const createPortfolio = (req, res) => {
  const {
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
  } = req.body;
  Portfolio.create({
    id: uuid(),
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
  })
    .then(() => res.send('Portfolio created.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const updatePortfolio = (req, res) => {
  const { id } = req.params;
  const {
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
  } = req.body;
  Portfolio.update({
    learner_id,
    showcase_projects,
    fields_of_interest,
    city_of_choices,
    educational_background,
    experience_level,
    relevant_experience_level,
    resume,
    review,
    reviewed_by,
    status,
    hiring_status,
  }, {
    where: { id },
  })
    .then(() => res.send('Portfolio updated.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};

export const deletePortfolio = (req, res) => {
  const { id } = req.params;
  Portfolio.destroy({
    where: { id },
  })
    .then(() => res.send('Portfolio Deleted.'))
    .catch(err => {
      console.error(err.stack);
      res.status(500);
    });
};
