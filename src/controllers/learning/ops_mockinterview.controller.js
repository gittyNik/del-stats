// import Sequelize from 'sequelize';
import { slotData } from '../../models/mock_interview_slots';
import { createMockInterviewsForCohort_afterCapstone } from '../../models/mock_interviews';

// const {
//   between, gte,
// } = Sequelize.Op;

const createMockInterviewsSlotsApi = (req, res) => {
  const { cohort_duration, program } = req.body;
  slotData(cohort_duration, program)
    .then(data => res.send({
      data,
      message: 'Mock Interview slots created',
    }))
    .catch(err => res.status(500).send({
      data: err,
      message: 'Failed in creating Mock Interview Slots',
    }));
};

const createMockInterviewsApi = (req, res) => {
  const { cohort_id, start_date } = req.body;
  createMockInterviewsForCohort_afterCapstone({ cohort_id, start_date })
    .then(data => res.send({
      data,
      message: 'Mock Interviews created',
    }))
    .catch(err => res.status(500).send({
      data: err,
      message: 'Failed in creating Mock Interviews',
    }));
};
export {
  createMockInterviewsSlotsApi,
  createMockInterviewsApi,
};
