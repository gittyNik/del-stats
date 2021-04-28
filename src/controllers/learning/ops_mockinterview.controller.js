// import Sequelize from 'sequelize';
import { slotData, deleteSlotById, updateSlotById } from '../../models/mock_interview_slots';
import {
  createMockInterviewsForMultipleCohort_afterCapstone,
  getAppliedCatalystDetailsByStatus,
  updateRequestStatus,
  createRequestForCatalyst,
} from '../../models/mock_interviews';
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
    cohort_duration, mock_interview_day, time_scheduled, status,
  } = req.body;
  updateSlotById({
    id, cohort_duration, mock_interview_day, time_scheduled, status,
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

export const getRequestsByStatusApi = (req, res) => {
  const { status } = req.params;
  getAppliedCatalystDetailsByStatus({ status })
    .then(data => res.status(201).send({
      data,
      message: 'Fetching successfull',
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      return res.status(500);
    });
};

export const updateRequestsStatusApi = (req, res) => {
  let user_id = req.jwtData.user.id;
  const { cohort_breakout_id, catalyst_id } = req.body;
  updateRequestStatus({
    user_id, cohort_breakout_id, catalyst_id,
  })
    .then(data => res.status(201).send({
      data,
      message: 'Status successfully updated',
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      return res.status(500);
    });
};

export const createRequestsApi = (req, res) => {
  let user_id = req.jwtData.user.id;
  const { cohort_breakout_id } = req.body;
  createRequestForCatalyst({ cohort_breakout_id, catalyst_id: user_id })
    .then(data => res.status(201).send({
      data,
      message: 'Request created successfully',
      type: 'success',
    }))
    .catch(err => {
      logger.error(err);
      return res.status(500);
    });
};
