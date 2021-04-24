// import Sequelize from 'sequelize';
import { slotData, deleteSlotById, updateSlotById } from '../../models/mock_interview_slots';
import { createMockInterviewsForMultipleCohort_afterCapstone } from '../../models/mock_interviews';
import logger from '../../util/logger';

export const createMockInterviewsSlotsApi = (req, res) => {
  const { cohort_duration, program } = req.body;
  slotData(cohort_duration, program)
    .then(data => res.status(201).send({
      data,
      message: 'Mock Interview slots created',
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      return res.status(500);
    });
};

export const createMockInterviewsApi = (req, res) => {
  const {
    cohorts, start_date, learners_exclude, program,
  } = req.body;
  createMockInterviewsForMultipleCohort_afterCapstone({
    cohorts, start_date, learners_exclude, program,
  })
    .then(data => res.status(201).send({
      data,
      message: 'Mock Interviews created',
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      return res.status(500);
    });
};

export const updateMockInterviewsSlotsByIdApi = (req, res) => {
  const { id } = req.params;
  const {
    cohort_duration, mock_interview_day, time_scheduled, slot_status,
  } = req.body;
  updateSlotById({
    id, cohort_duration, mock_interview_day, time_scheduled, slot_status,
  })
    .then(data => res.status(201).send({
      data,
      message: 'Mock Interviews slot successfully updated',
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      return res.status(500);
    });
};

export const deleteMockInterviewsSlotsByIdApi = (req, res) => {
  const { id } = req.params;
  deleteSlotById({ id })
    .then(data => res.status(201).send({
      data,
      message: 'Mock Interviews slot successfully deleted',
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      return res.status(500);
    });
};
