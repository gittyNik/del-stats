import Sequelize, { NOW } from 'sequelize';
import db from '../database';

export const AgreementTemplates = db.define('agreement_templates', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  document_identifier: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  program: {
    type: Sequelize.STRING,
  },
  cohort_duration: {
    type: Sequelize.STRING,
  },
  is_isa: {
    type: Sequelize.BOOLEAN,
    default: false,
  },
  is_job_guarantee: {
    type: Sequelize.BOOLEAN,
    default: false,
  },
  payment_type: {
    type: Sequelize.STRING,
  },
  payment_details: {
    type: Sequelize.JSON,
  },
  modified_by: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
  // Field related to learner documents
  is_learner_document: {
    type: Sequelize.BOOLEAN, // flag to differentiate learner documents from agreement documents
    default: false,
  },
  non_isa_type: {
    type: Sequelize.STRING, // Ex: Loan, Upfront etc.
    allowNull: true,
  },
  document_category: {
    type: Sequelize.STRING, // Name of the options. Ex: learner-option-1 or guardian-option-1
    allowNull: true,
  },
  is_required: Sequelize.BOOLEAN,
  document_count: {
    type: Sequelize.INTEGER, // Number of documents needed. For aadhar=2(front and back)
    default: 1,
  },
});

export const getAgreementTemplate = (
  {
    program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
  },
) => {
  cohort_duration = String(cohort_duration);
  if (is_job_guarantee === null || payment_type === null) {
    return AgreementTemplates.findOne(
      {
        where: {
          program,
          cohort_duration,
          is_isa,
          is_learner_document: false,
        },
        attributes: ['document_identifier', 'payment_details'],
        raw: true,
      },
    );
  }
  return AgreementTemplates.findOne(
    {
      where: {
        program,
        cohort_duration,
        is_isa,
        is_job_guarantee,
        payment_type,
        is_learner_document: false,
      },
      attributes: ['document_identifier', 'payment_details'],
      raw: true,
    },
  );
};

export const createAgreementTemplates = ({
  program,
  cohort_duration,
  is_isa,
  is_job_guarantee,
  payment_type,
  payment_details,
  updated_user,
  document_identifier,
}) => {
  let modified_by = [{ user: updated_user, time: NOW() }];
  return AgreementTemplates.create(
    {
      program,
      cohort_duration,
      is_isa,
      is_job_guarantee,
      payment_type,
      payment_details,
      modified_by,
      document_identifier,
      created_at: Sequelize.literal('NOW()'),
      updated_at: Sequelize.literal('NOW()'),
    },
  );
};

export const updateAgreementTemplates = (
  id, program,
  cohort_duration,
  is_isa,
  is_job_guarantee,
  payment_type,
  payment_details,
  updated_user,
  document_identifier,
) => {
  let modified_by = { user: updated_user, time: new Date() };
  return AgreementTemplates.update({
    program,
    cohort_duration,
    is_isa,
    is_job_guarantee,
    payment_type,
    payment_details,
    document_identifier,
    modified_by: Sequelize.fn('array_append', Sequelize.col('modified_by'), modified_by),
  }, { where: { id } });
};

export const deleteAgreementTemplate = (id) => AgreementTemplates.destroy(
  { where: { id } },
);
