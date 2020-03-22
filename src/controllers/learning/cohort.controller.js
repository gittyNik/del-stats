import {
  Cohort, getFutureCohorts, getCohortLearnerDetails,
  getCohortLearnerDetailsByName, beginCohortWithId,
  getCohortFromLearnerId,
} from '../../models/cohort';
import { createOrUpdateCohortBreakout } from '../../models/cohort_breakout';

export const getCohorts = (req, res) => {
  Cohort.findAll()
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const getCohortByName = (req, res) => {
  const { year, location, name } = req.params;

  getCohortLearnerDetailsByName({ name, location, year })
    .then((cohorts) => {
      res.json({ cohorts });
    }).catch((e) => {
      console.error(e);
      res.sendStatus(404);
    });
};

export const getCohort = (req, res) => {
  getCohortLearnerDetails(req.params.id)
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

export const getUpcomingCohorts = (req, res) => {
  getFutureCohorts()
    .then((data) => {
      res.send({ data });
    })
    .catch(() => res.sendStatus(404));
};

export const createUpdateCohortBreakout = (req, res) => {
  let {
    cohort_id, cohort_topic_id, time_scheduled,
  } = req.body;
  createOrUpdateCohortBreakout(cohort_topic_id, cohort_id, time_scheduled).then((data) => {
    res.status(201).json({ data });
  })
    .catch(err => res.status(500).send({ err }));
};

export const beginCohort = (req, res) => {
  const { id } = req.params;

  beginCohortWithId(id)
    .then(cohort => {
      res.send(cohort);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(404);
    });

  // add cohort.learners
  // update cohort_joining on firewall_application
  // notify learning_ops_manager
  // schedule beginMilestone
};

export const beginMilestone = () => {
  // update cohort_milestone.learners from cohort
};
// create cohort_milestones
// create teams for each milestone

export const getCohortByLearnerId = (req, res) => {
  const {
    id
  } = req.params;

  getCohortFromLearnerId(id)
    .then(cohort => {
      res.send({
        text: "Cohort Details",
        data: cohort
      })
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(404);
    })
};
