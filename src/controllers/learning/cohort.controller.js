import Sequelize from 'sequelize';
import { Cohort } from '../../models/cohort';

export const getCohorts = (req, res) => {
  Cohort.findAll()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

const getCohortLearners = () => Promise.resolve([]);

export const getCohortByName = (req, res) => {
  const { year, location, name } = req.params;

  Cohort.findAll({ where: { name, location }, raw: true })
    .then((cohorts) => {
      const learnerGetters = cohorts.filter(c => c.start_date.getFullYear().toString() === year)
        .map(cohort => getCohortLearners(cohort).then((learners) => {
          cohort.learnerDetails = learners;
          return cohort;
        }));
      return Promise.all(learnerGetters);
    }).then((cohorts) => {
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

export const createSpotters = cohort => Promise.resolve(cohort);

// currently returning cohorts starting today
export const populateCurrentCohorts = () => {
  const today = new Date();
  const tonight = new Date();

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return Cohort.findAll({
    where: {
      start_date: { $between: [today, tonight] },
    },
  });
};

export const resetSpotters = async (req, res) => {
  res.sendStatus(500);
};

export const getUpcomingCohorts = (req, res) => {
  const tonight = new Date();

  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  Cohort.findAll({
    where: {
      start_date: { [Sequelize.Op.gt]: tonight },
    },
  }).then((data) => {
    res.send({ data });
  }).catch(() => res.sendStatus(404));
};
