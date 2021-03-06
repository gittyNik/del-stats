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
  learnerDetails,
  addLearnerStatus,
  updateCohortById,
  findAllCohorts,
} from '../../models/cohort';
import logger from '../../util/logger';

// import { USER_ROLES } from '../../models/user';

export const getCohorts = (req, res) => {
  Cohort.findAll()
    .then((data) => res.json({ data }))
    .catch((error) => {
      logger.error(error);
      return res.status(500);
    });
};

export const getCohortsByProgram = (req, res) => {
  let { program_id, duration } = req.query;
  program_id = program_id || 'tep';
  duration = duration || 16;

  let whereObject = {
    program_id,
    duration,
    status: 'live',
  };
  findAllCohorts(whereObject)
    .then((data) => res.json({ data }))
    .catch((error) => {
      logger.error(error);
      return res.status(500);
    });
};

export const getCohortByName = (req, res) => {
  const { year, location, name } = req.params;

  getCohortLearnerDetailsByName({ name, location, year })
    .then((cohorts) => {
      res.json({ cohorts });
    })
    .catch((error) => {
      logger.error(error);
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
    .catch((error) => res.status(500).send({ err: error }));
};

export const updateCohort = (req, res) => {
  const {
    location, program, start_date,
    status, name, duration,
    type,
  } = req.body;
  const { id } = req.params;
  const updated_by_id = req.jwtData.user.id;
  const updated_by_name = req.jwtData.user.name;
  updateCohortById({
    id,
    location,
    program,
    start_date,
    status,
    name,
    duration,
    type,
    updated_by_id,
    updated_by_name,
  }).then((data) => res.json({ data }))
    .catch((error) => {
      logger.error(error);
      return res.status(500);
    });
};

export const deleteCohort = (req, res) => {
  const { id } = req.params;
  Cohort.destroy({ where: { id } })
    .then(() => res.status(204))
    .catch((error) => {
      logger.error(error);
      return res.status(500);
    });
};

export const getUpcomingCohorts = (req, res) => {
  getFutureCohorts()
    .then((data) => {
      res.send({ data });
    })
    .catch(() => res.sendStatus(404));
};

export const beginCohort = (req, res) => {
  const { id } = req.params;

  beginCohortWithId(id)
    .then((cohort) => {
      res.send(cohort);
    })
    .catch((error) => {
      logger.error(error);
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
    .catch((error) => {
      logger.error(error);
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
    .catch((error) => {
      logger.error(error);
      res.sendStatus(404);
    });
};

export const moveLearnertoDifferentCohortEndpoint = async (req, res) => {
  const { learners, current_cohort_id, future_cohort_id } = req.body;
  const updated_by_id = req.jwtData.user.id;
  const updated_by_name = req.jwtData.user.name;
  try {
    let bk = await moveLearnertoDifferentCohort(
      {
        learners,
        current_cohort_id,
        future_cohort_id,
        updated_by_id,
        updated_by_name,
      },
    );
    res.send({
      message: `Learners moved from ${current_cohort_id} to Cohort: ${future_cohort_id}`,
      data: bk,
      type: 'success',
    });
  } catch (error) {
    logger.error('Unable to move leaners: ');
    logger.error(error);
    res.status(500);
  }
};

export const removeLearnerEndpoint = async (req, res) => {
  const { learner_id, current_cohort_id } = req.body;
  const updated_by_id = req.jwtData.user.id;
  const updated_by_name = req.jwtData.user.name;
  try {
    let bk = await removeLearner(
      {
        learner_id,
        current_cohort_id,
        updated_by_id,
        updated_by_name,
      },
    );
    res.send({
      message: 'Remove Learner Endpoint',
      data: bk,
      type: 'success',
    });
  } catch (error) {
    logger.error('Unable to remove leaners: ');
    logger.error(error);
    res.status(500);
  }
};

export const addLearnerEndpoint = (req, res) => {
  const { learners, cohort_id } = req.body;
  const updated_by_id = req.jwtData.user.id;
  const updated_by_name = req.jwtData.user.name;
  addLearner(
    {
      learners,
      cohort_id,
      updated_by_id,
      updated_by_name,
    },
  ).then(data => res.status(200).send({
    message: `Learners added to new cohort: ${cohort_id}`,
    data,
    type: 'success',
  })).catch(error => {
    logger.error('ERROR ADDING LEARNER');
    logger.error(error);
    res.status(500);
  });
};

export const addLearnerStatusAPI = (req, res) => {
  const {
    learner_id, current_cohort_id, status, future_cohort_id,
  } = req.body;
  const updated_by_id = req.jwtData.user.id;
  const updated_by_name = req.jwtData.user.name;
  addLearnerStatus({
    user_id: learner_id,
    updated_by_id,
    updated_by_name,
    cohort_id: current_cohort_id,
    status,
    future_cohort_id,
  }).then(data => res.status(200).send({
    message: `Learners added to new cohort: ${current_cohort_id}`,
    data,
    type: 'success',
  })).catch(error => {
    logger.error('ERROR ADDING LEARNER Status:');
    logger.error(error);
    res.status(500);
  });
};

export const liveCohorts = (req, res) => {
  getLiveCohorts()
    .then(data => res.status(200).send({
      message: 'Live Cohorts',
      data,
      type: 'success',
    })).catch(error => {
      logger.error('Unable to get live cohorts');
      logger.error(error);
      res.status(500);
    });
};

export const learnerDetailsAPI = async (req, res) => {
  const { cohort_ids, attributes } = req.body;

  try {
    const result = await learnerDetails({ cohort_ids, attributes });

    return res.status(200).send({
      message: 'Get all learner details Successful!',
      data: result,
      type: 'success',
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).send({
      message: 'Getting all learner details Failed!',
      type: 'failure',
    });
  }
};
