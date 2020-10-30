import Sequelize from 'sequelize';
import db from '../database';

export const CompanyProfile = db.define('company_profile', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  description: Sequelize.TEXT,
  logo: {
    type: Sequelize.STRING,
  },
  website: {
    type: Sequelize.STRING,
  },
  worklife: {
    type: Sequelize.TEXT,
  },
  perks: {
    type: Sequelize.TEXT,
  },
  views: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  created_at: {
    type: Sequelize.DATE,
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  tags: {
    type: Sequelize.ARRAY(Sequelize.UUID),
  },
  recruiters: Sequelize.ARRAY(Sequelize.UUID),
});

export default CompanyProfile;
