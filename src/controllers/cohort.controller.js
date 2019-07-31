import Cohort from '../models/cohort';
import {getCohortStudents} from '../controllers/student.controller';
import createChunks from "../util/createChunks";

export const getCohorts = (req, res) => {
  Cohort.findAll()
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

const getCohortLearners = cohort => {
  return Promise.resolve([]);
}

export const getCohortByName = (req, res) => {
  const {year, city, cohort_name} = req.params;

  Cohort.findAll({where: {name : cohort_name, location : city}})
  .then( cohorts => {
    let learnerGetters = cohorts.filter(c=>c.start_date.getFullYear().toString()===year)
    .map(cohort => {
      return getCohortLearners(cohort).then(learners => {
        cohort.learnerDetails = learnerDetails;
        return cohort;
      });
    });
    return Promise.all(learnerGetters);
  }).then(cohorts=>{
    res.json({cohorts});
  }).catch(e => res.status(500).send(e))

}

export const getCohort = (req, res) => {
  Cohort.findByPk(req.params.id)
  .then(cohort => {
    return getCohortLearners(cohort).then(learners => {
      cohort.learners = learners;
      return cohort;
    });
  })
  .then(cohort => {
    res.json({cohort});
  })
  .catch(err => res.status(500).send(err));
}

export const createCohort = (req, res) => {
  let {name, location, program, start_date} = req.body;
  start_date = new Date(+start_date)
  Cohort.create({name, location, program, start_date})
  .then(data => {
    res.status(201).json({data});
  })
  .catch(err => res.status(500).send({err}));
}

export const updateCohort = (req, res) => {
  const {location, program, start_date} = req.body;
  const {id} = req.params;
  Cohort.update({location, program, start_date}, {where: {id}})
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const deleteCohort = (req, res) => {
  Cohort.destroy({where: {id}})
  .then(() => res.status(204))
  .catch(err => res.status(500).send(err));
}

export const createSpotters = (cohort) => {
  return Promise.resolve(cohort);
}

export const populateCurrentCohorts = () => {
  let today = new Date();
  let tonight = new Date();

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return Cohort.findAll({ where: {
    start_date: {$between: [today, tonight]}
  }});
} 

export const resetSpotters = async (req, res) => {
  res.sendStatus(500);
}

export const getUpcomingCohorts = (req, res) => {
  res.send("Lists of upcoming cohorts");
}
