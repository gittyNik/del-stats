import {
  Cohort,
  getFutureCohorts,
  getCohortLearnerDetails,
  getCohortLearnerDetailsByName,
  beginCohortWithId,
  getCohortFromLearnerId,
  moveLearnertoDifferentCohort,
  removeLearner,
  addLearner,
  beginParallelCohorts,
  getLiveCohorts,
} from '../../models/cohort';
import {
  createOrUpdateCohortBreakout,
  markBreakoutFinished,
} from '../../models/cohort_breakout';
import logger from '../../util/logger';

import { USER_ROLES } from '../../models/user';

export const getCohorts = (req, res) => {
  Cohort.findAll()
    .then((data) => res.json({ data }))
    .catch((err) => res.status(500).send(err));
};

export const getCohortByName = (req, res) => {
  const { year, location, name } = req.params;

  getCohortLearnerDetailsByName({ name, location, year })
    .then((cohorts) => {
      res.json({ cohorts });
    })
    .catch((e) => {
      logger.error(e);
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
    name,
    location,
    program,
    start_date,
  })
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch((err) => res.status(500).send({ err }));
};

export const updateCohort = (req, res) => {
  const { location, program, start_date } = req.body;
  const { id } = req.params;
  Cohort.update({ location, program, start_date }, { where: { id } })
    .then((data) => res.json({ data }))
    .catch((err) => res.status(500).send(err));
};

export const deleteCohort = (req, res) => {
  const { id } = req.params;
  Cohort.destroy({ where: { id } })
    .then(() => res.status(204))
    .catch((err) => res.status(500).send(err));
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
    cohort_id, topic_id, time_scheduled, catalyst_id,
  } = req.body;
  const { id: user_id, role } = req.jwtData.user;
  if (user_id === catalyst_id || role === USER_ROLES.SUPERADMIN) {
    createOrUpdateCohortBreakout(
      topic_id,
      cohort_id,
      time_scheduled,
      req.jwtData.user.name,
    )
      .then((data) => {
        res.status(201).json({
          data,
        });
      })
      .catch((err) => res.status(500).send({
        err,
      }));
  } else {
    res.status(403).send('You do not have access to this data!');
  }
};

export const markCompleteBreakout = (req, res) => {
  let {
    cohort_breakout_id, catalyst_id,
  } = req.body;
  const { id: user_id, role } = req.jwtData.user;
  if (user_id === catalyst_id || role === USER_ROLES.SUPERADMIN) {
    markBreakoutFinished(cohort_breakout_id, req.jwtData.user.name)
      .then((data) => {
        res.status(201).json({
          data,
        });
      })
      .catch((err) => res.status(500).send({
        err,
      }));
  } else {
    res.status(403).send('You do not have access to this data!');
  }
};

export const beginCohort = (req, res) => {
  const { id } = req.params;

  beginCohortWithId(id)
    .then((cohort) => {
      res.send(cohort);
    })
    .catch((err) => {
      logger.error(err);
      res.sendStatus(404);
    });

  // add cohort.learners
  // update cohort_joining on firewall_application
  // notify learning_ops_manager
  // schedule beginMilestone
};

export const beginParallelCohort = (req, res) => {
  const { ids } = req.body;

  beginParallelCohorts(ids)
    .then((cohort) => {
      res.send(cohort);
    })
    .catch((err) => {
      logger.error(err);
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
  const { id } = req.params;

  getCohortFromLearnerId(id)
    .then((cohort) => {
      res.send({
        text: 'Cohort Details',
        data: cohort,
      });
    })
    .catch((err) => {
      logger.error(err);
      res.sendStatus(404);
    });
};

export const moveLearnertoDifferentCohortEndpoint = async (req, res) => {
  const { learners, current_cohort_id, future_cohort_id } = req.body;
  try {
    let bk = await moveLearnertoDifferentCohort(
      learners,
      current_cohort_id,
      future_cohort_id,
    );
    res.send({
      message: 'Move Learner Endpoint',
      data: bk,
      type: 'success',
    });
  } catch (err) {
    res.status(500).send(err);
  }
};

export const removeLearnerEndpoint = async (req, res) => {
  const { learner_id, current_cohort_id } = req.body;
  let bk = await removeLearner(learner_id, current_cohort_id);
  res.send({
    message: 'Remove Learner Endpoint',
    data: bk,
    type: 'success',
  });
};

export const addLearnerEndpoint = (req, res) => {
  const { learners, cohort_id } = req.body;
  addLearner(learners, cohort_id).then(data => res.status(200).send({
    message: 'Add Learner Endpoint Result',
    data,
    type: 'success',
  })).catch(err => {
    res.status(500).send(err);
  });
};

export const liveCohorts = (req, res) => {
  getLiveCohorts()
    .then(data => res.status(200).send({
      message: 'Live Cohorts',
      data,
      type: 'success',
    })).catch(err => {
      res.status(500).send(err);
    });
};
