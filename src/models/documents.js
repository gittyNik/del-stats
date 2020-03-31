import Sequelize from 'sequelize';
import db from '../database';

export const application_status = ['requested', 'signed', 'payment-pending', 'payment-partial', 'payment-complete'];

export const Documents = db.define('documents', {
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
  user_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  is_verified: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  document_details: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  payment_status: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  is_isa: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: Sequelize.ENUM(...application_status),
    allowNull: false,
  },
});

export const getDocumentsFromId = id => Documents.findOne(
  { where: { id } },
).then(documents => documents);
