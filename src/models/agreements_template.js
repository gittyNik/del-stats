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
    unique: true,
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
});

export const getAgreementTemplate = (
  program,
  cohort_duration,
  is_isa,
  is_job_guarantee,
  payment_type,
) => AgreementTemplates.findOne(
  {
    where: {
      program,
      cohort_duration,
      is_isa,
      is_job_guarantee,
      payment_type,
    },
    attributes: ['document_identifier'],
    raw: true,
  },
);

export const createAgreementTemplates = (
  program,
  cohort_duration,
  is_isa,
  is_job_guarantee,
  payment_type,
  payment_details,
  updated_user,
  document_identifier,
) => {
  let modified_by = { user: updated_user, time: NOW() };
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
  let modified_by = { user: updated_user, time: NOW() };
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
