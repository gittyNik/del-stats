import Sequelize from 'sequelize';
import db from '../database';
import { Test } from './test';
import { User } from './user';
import { Cohort } from './cohort';

const { in: opIn } = Sequelize.Op;

export const Application = db.define('applications', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.UUID,
    allowNull: false,
    references: { model: 'users' },
  },
  cohort_applied: {
    type: Sequelize.UUID,
    references: { model: 'cohorts' },
  },
  cohort_joining: {
    type: Sequelize.UUID,
    references: { model: 'cohorts' },
  },
  status: Sequelize.ENUM(
    'applied', 'review_pending', 'offered',
    'rejected', 'joined', 'archieved',
  ),
  payment_details: Sequelize.JSON,
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
  },
});

Application.prototype.populateTestResponses = () => Test
  .findAll({ where: { application_id: this.id }, raw: true })
  .then(test_series => ({ ...this, test_series }));

export const getPendingApplications = () => Application.findAll({
  order: Sequelize.col('created_at'),
  where: { status: { [opIn]: ['review_pending', 'offered'] } },
});

export const getPendingApplicationCohorts = () => Application.findAll({
  order: Sequelize.col('created_at'),
  where: { status: { [opIn]: ['joined', 'review_pending', 'offered'] } },
  include: [Cohort, User],
  raw: true,
});

export const submitApplication = (id) => Application.update({
  status: 'review_pending',
}, {
  where: { id },
  returning: true,
  raw: true,
})
  .then(result => result[1][0]);
