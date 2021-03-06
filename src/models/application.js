import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import db from '../database';
import { Test } from './test';
import { User } from './user';
import { Cohort, getUpcomingCohort } from './cohort';
import { PaymentDetails } from './payment_details';

const { in: opIn } = Sequelize.Op;

export const APPLICATION_STAGE = [
  'firewall-test', 'isa-selection', 'cohort-selection_payment',
  'cohort-selection_job-guarantee',
  'cohort-selection-loan', 'verification-digio-document-creation',
  'verification-digio-esign',
  'verification-document-upload', 'verification-document-verified',
  'verification-document-change-requested',
  'verification-document-reuploaded',
  'verification-document-rejected',
  'payment_full',
  'authorisation-github', 'authorisation-zoom',
  'mandate-request', 'mandate-created', 'mandate-failed',
  'verification-digio-esign-failed',
  'initial_payment-failed', 'full_payment-failed', 'part_payment-failed',
  'initial_payment-success', 'full_payment-success', 'part_payment-success',
];

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
    'applied',
    'review_pending',
    'offered',
    'rejected',
    'joined',
    'archieved',
  ),
  stage: Sequelize.ENUM(...APPLICATION_STAGE),
  payment_details: Sequelize.JSON,
  is_isa: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  offered_isa: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  is_job_guarantee: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
  },
  payment_type: {
    type: Sequelize.STRING,
  },
  payment_option_selected: {
    type: Sequelize.UUID,
    references: { model: 'payment_details', key: 'id' },
  },
  upfront_plan_5_enabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  program_id: {
    type: Sequelize.STRING,
    references: { model: 'programs', key: 'id' },
  },
  process_statuses: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
});

// process_statuses = [{
//   type: 'failure, success',
//   time: new Date(),
// }];

Application.prototype.populateTestResponses = () => Test.findAll({
  where: { application_id: this.id },
  raw: true,
}).then((test_series) => ({ ...this, test_series }));

export const getPendingApplications = () => Application.findAll({
  order: Sequelize.col('created_at'),
  where: { status: { [opIn]: ['review_pending', 'offered'] } },
});

export const getPendingApplicationCohorts = () => Application.findAll({
  order: Sequelize.col('created_at'),
  where: { status: { [opIn]: ['joined', 'review_pending', 'offered'] } },
  include: [{ model: Cohort, as: 'applicationCohortApplied' }, User],
  raw: true,
});

export const submitApplication = (id) => Application.update(
  {
    status: 'review_pending',
  },
  {
    where: { id },
    returning: true,
    raw: true,
  },
).then((result) => result[1][0]);

export const getStatsForDay = (date) => {
  const today = date || new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  const calcCount = (applications) => {
    const count = {
      total: applications.length,
    };
    applications.forEach((a) => {
      count[a.status] = count[a.status] || 0;
      count[a.status]++;
    });
    return count;
  };

  return Promise.all([
    getUpcomingCohort().then((cohort) => (cohort
      ? Application.findAll({
        where: { cohort_joining: cohort.id },
      })
      : [])),
    Application.findAll({
      where: {
        created_at: {
          [Sequelize.Op.between]: [
            new Date(today - 24 * 3600 * 1000),
            new Date(today - 1),
          ],
        },
      },
    }),
  ])
    .then((lists) => lists.map(calcCount))
    .then(([cohort, yesterday]) => ({ cohort, yesterday }));
};

export const updateCohortJoining = (user_id, cohort_joining) => Application.update(
  {
    cohort_joining,
  },
  {
    where: {
      user_id,
    },
    returning: true,
    raw: true,
  },
);

export const getApplicationPaymentSelected = (user_id) => Application.findOne({
  where: {
    user_id,
  },
  include: [{
    model: PaymentDetails,
    as: 'ApplicationPayment',
    foreignKey: 'payment_option_selected',
  }],
  attributes: ['payment_option_selected', 'payment_type'],
  raw: true,
});

export const getApplicationStage = (user_id) => Application.findOne({
  where: {
    user_id,
  },
  attributes: ['stage', 'is_isa', 'is_job_guarantee', 'offered_isa', 'process_statuses',
    'cohort_applied', 'cohort_joining', 'status', 'payment_type', 'payment_option_selected'],
  raw: true,
}).then(async data => {
  let cohortDetails = await Cohort.findOne({
    where: {
      id: data.cohort_applied,
    },
    raw: true,
  });
  data.cohort_details = cohortDetails;
  return data;
});

export const setApplicationStage = (
  {
    user_id, stage, cohort_applied,
    is_isa, is_job_guarantee, payment_type, offered_isa,
    payment_option_selected,
    cohort_joining,
  },
) => Application.update({
  stage,
  cohort_applied,
  is_isa,
  is_job_guarantee,
  payment_type,
  offered_isa,
  payment_option_selected,
  cohort_joining,
}, {
  where: {
    user_id,
  },
});

export const setApplicationStageByApplicationId = (
  {
    application_id, user_id, stage, cohort_applied,
    is_isa, is_job_guarantee, payment_type, offered_isa,
    payment_option_selected,
  },
) => Application.update({
  stage,
  cohort_applied,
  is_isa,
  is_job_guarantee,
  payment_type,
  offered_isa,
  payment_option_selected,
  user_id,
}, {
  where: {
    id: application_id,
  },
});

export const createApplication = (
  user_id, cohort_applied, cohort_joining,
  status, is_isa, is_job_guarantee, offered_isa,
) => Application.create({
  id: uuid(),
  user_id,
  cohort_applied,
  cohort_joining,
  status,
  is_isa,
  offered_isa,
  is_job_guarantee,
  created_at: new Date(),
  updated_at: new Date(),
});

export const offerISA = (
  user_id,
  offered_status,
) => Application.update({
  offered_status,
}, {
  where: {
    user_id,
  },
  returning: true,
  raw: true,
});

export const getProcessStatuses = (user_id) => Application.findOne({
  where: {
    user_id,
  },
  attributes: ['stage', 'is_isa', 'is_job_guarantee', 'offered_isa',
    'cohort_applied', 'cohort_joining', 'status', 'payment_type', 'process_statuses',
    'payment_option_selected',
  ],
  raw: true,
}).then(async data => {
  let cohortDetails = await Cohort.findOne({
    where: {
      id: data.cohort_applied,
    },
    raw: true,
  });
  data.cohort_details = cohortDetails;
  return data;
});

export const logProcessStatus = (user_id, event) => {
  let data = getProcessStatuses(user_id);
  if (data.process_statuses === null) {
    data.process_statuses = [];
  }
  const process_statuses = (data.process_statuses).push({ type: event, time: new Date() });
  Application.update({
    process_statuses,
  }, {
    where: {
      user_id,
    },
    returning: true,
    raw: true,
  });
};

export const getLatestbyUserId = (user_id) =>
  Application.findOne({
    order: [[Sequelize.col("created_at"), Sequelize.literal("DESC")]],
    where: { user_id },
  });

export const updateApplicationStatusByUserId = (user_id, status) =>
  getLatestbyUserId(user_id).then((application) => {
    return Application.update(
      {
        status,
        updated_at: new Date(),
      },
      {
        order: [[Sequelize.col("created_at"), Sequelize.literal("DESC")]],
        where: {
          id: application.id,
        },
      }
    );
  });
