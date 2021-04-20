// import Sequelize from 'sequelize';
import { slotData } from '../../models/mock_interview_slots';
import { createMockInterviewsForMultipleCohort_afterCapstone } from '../../models/mock_interviews';

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
  const {
    cohorts, start_date, learners_exclude, program,
  } = req.body;
  createMockInterviewsForMultipleCohort_afterCapstone({
    cohorts, start_date, learners_exclude, program,
  })
    .then(data => res.send({
      data,
      message: 'Mock Interviews created',
    }))
    .catch(err => {
      console.log(err);
      res.json({
        data: err,
        message: 'Failed in creating Mock Interviews',
      });
    });
};
export {
  createMockInterviewsSlotsApi,
  createMockInterviewsApi,
};
