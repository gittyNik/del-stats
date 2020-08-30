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
    unique: true,
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
  status: {
    type: Sequelize.ENUM(...application_status),
    allowNull: false,
  },
  updated_by: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
});

export const getAllDocuments = (req, res) => {
  Documents.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const getDocumentsFromId = id => Documents.findOne(
  { where: { id } },
).then(documents => documents);

export const getDocumentsByStatus = status => Documents.findAll(
  {
    where: { status },
    raw: true,
  },
);

export const getDocumentsByUser = user_id => Documents.findAll(
  {
    where: { user_id },
    raw: true,
  },
);

export const createUserEntry = (user_id, document_details, status, payment_status,
  is_isa = false, is_verified = false) => Documents.create(
  {
    user_id,
    document_details,
    status,
    payment_status,
    is_isa,
    is_verified,
  },
);

export const updateUserEntry = (user_id, document_details, status, payment_status,
  is_isa = false, is_verified = false) => Documents.update({
  document_details,
  status,
  payment_status,
  is_isa,
  is_verified,
}, { where: { user_id } });
