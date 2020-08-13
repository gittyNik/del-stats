import Sequelize from 'sequelize';
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
    raw: true,
  },
);

export default AgreementTemplates;
