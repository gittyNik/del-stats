import { Cohort, getFutureCohorts, getCohortLearnerDetails } from '../../models/cohort';

export const getCohorts = (req, res) => {
  Cohort.findAll()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getCohortByName = (req, res) => {
  const { year, location, name } = req.params;

  getCohortLearnerDetails({ name, location, year })
    .then((cohorts) => {
      res.json({ cohorts });
    }).catch((e) => {
      console.error(e);
      res.sendStatus(404);
    });
};

export const getCohort = (req, res) => {
  Cohort.findByPk(req.params.id)
    .then(cohort => getCohortLearners(cohort).then((learners) => {
      cohort.learners = learners;
      return cohort;
    }))
    .then((cohort) => {
      res.json({ cohort });
    })
    .catch(() => res.sendStatus(404));
};

export const createCohort = (req, res) => {
  let {
    name, location, program, start_date,
  } = req.body;
  start_date = new Date(+start_date);
  Cohort.create({
    name, location, program, start_date,
  })
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch(err => res.status(500).send({ err }));
};

export const updateCohort = (req, res) => {
  const { location, program, start_date } = req.body;
  const { id } = req.params;
  Cohort.update({ location, program, start_date }, { where: { id } })
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const deleteCohort = (req, res) => {
  const { id } = req.params;
  Cohort.destroy({ where: { id } })
    .then(() => res.status(204))
    .catch(err => res.status(500).send(err));
};

// currently returning cohorts starting today


export const getUpcomingCohorts = (req, res) => {
  getFutureCohorts()
    .then((data) => {
      res.send({ data });
    })
    .catch(() => res.sendStatus(404));
};
