import Sequelize from 'sequelize';
import _ from 'lodash';
import db from '../database';

export const application_status = [
  'requested',
  'signed',
  'payment-pending',
  'payment-partial',
  'payment-complete',
];

export const mandatory = {
  AADHAR_FRONT: 'aadhar-front',
  AADHAR_BACK: 'aadhar-back',
  BANK_STATEMENT: 'bank-statement',
  GRADUATION_CERTIFICATE: 'graduation-certificate',
  PROOF_OF_INCOME: 'proof-of-income',
};

export const learner_options_front = {
  LEARNER_PAN_CARD_FRONT: 'learner-pan-card-front',
  LEARNER_DL_FRONT: 'learner-dl-front',
  LEARNER_RATION_CARD_FRONT: 'learner-ration-card-front',
  LEARNER_VOTER_ID_FRONT: 'learner-voter-id-front',
  LEARNER_PASSPORT: 'learner-passport',
};

export const learner_options_back = {
  LEARNER_PAN_CARD_BACK: 'learner-pan-card-back',
  LEARNER_DL_BACK: 'learner-dl-back',
  LEARNER_RATION_CARD_BACK: 'learner-ration-card-front',
  LEARNER_VOTER_ID_BACK: 'learner-voter-id-back',
};

export const guardian_options_front = {
  GUARDIAN_PAN_CARD_FRONT: 'guardian-pan-card-front',
  GUARDIAN_DL_FRONT: 'guadian-dl-front',
  GUARDIAN_RATION_CARD_FRONT: 'guadian-ration-card-front',
  GUARDIAN_VOTER_ID_FRONT: 'guadian-voter-id-front',
  GUARDIAN_PASSPORT: 'guadian-passport',
};

export const guardian_options_back = {
  GUARDIAN_PAN_CARD_BACK: 'guadian-pan-card-back',
  GUARDIAN_DL_BACK: 'guadian-dl-back',
  GUARDIAN_RATION_CARD_BACK: 'guadian-ration-card-front',
  GUARDIAN_VOTER_ID_BACK: 'guadian-voter-id-back',
};

const user_document_factory = (document_name, is_required, options = false) => {

  const ud = {
    document_name,
    is_required,
    is_verified: false,
    document_path: '',
    details: {
      comment: '',
      updated_by: '',
      updated_at: '',
    },
  };
  if (options) {
    ud.list = Object.keys(options).map(k => options[k]);
    ud.selected = '';
  }
  return ud;
};

export const empty_user_documents = () => ([
  user_document_factory(`learner-${mandatory.AADHAR_FRONT}`, true),
  user_document_factory(`learner-${mandatory.AADHAR_BACK}`, true),
  user_document_factory(`learner-${mandatory.BANK_STATEMENT}`, true),
  user_document_factory(`learner-${mandatory.GRADUATION_CERTIFICATE}`, true),
  user_document_factory('learner-options-front', true, learner_options_front),
  user_document_factory('learner-options-back', false, learner_options_back),
  user_document_factory(`guardian-${mandatory.AADHAR_FRONT}`, true),
  user_document_factory(`guardian-${mandatory.AADHAR_BACK}`, true),
  user_document_factory(`guardian-${mandatory.BANK_STATEMENT}`, true),
  user_document_factory(`guardian-${mandatory.PROOF_OF_INCOME}`, true),
  user_document_factory('guardian-options-front', true, guardian_options_front),
  user_document_factory('guardian-options-back', false, guardian_options_back),
]);

export const createOrUpdateUserDocument = (document) => {
  if (typeof document === 'undefined') {
    return empty_user_documents();
  }
  const empty = empty_user_documents();
  const optional_ud = empty.find(_ud => {
    if (_ud.list) {
      return _ud.list.includes(document.document_name);
    }
    return false;
  });
  if (optional_ud) {
    optional_ud.document_name = document.document_name;
    optional_ud.is_verified = document.is_verified || false;
    optional_ud.document_path = document.document_path;
    return empty;
  }
  const ud = empty.find(_ud => _ud.document_name === document.document_name);
  ud.is_verified = document.is_verified || false;
  ud.document_path = document.document_path;
  return empty;
};

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
  user_documents: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
});

export const getAllDocuments = () => Documents.findAll({});

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

export const createUserEntry = ({
  user_id, document_details, status, payment_status,
  is_isa = false, is_verified = false, user_document,
}) => Documents.create({
  user_id,
  document_details,
  status,
  payment_status,
  is_isa,
  is_verified,
  user_documents: createOrupdateUserDocument(user_document),
});

export const insertIndividualDocument = (
  user_id,
  document,
) => Documents.findOne({
  where: {
    user_id,
  },
})
  .then((learnerDocument) => {
    if (_.isEmpty(learnerDocument)) {
      /*
      document should contain these properties
      const {document_name, is_verified, document_path} = document;
      */
      return createUserEntry({ user_id, user_document: document });
    }
    const { document_name, is_verified, document_path } = document;
    const user_documents = learnerDocument.user_documents;

    return learnerDocument.update({
      user_documents: learnerDocument.user_documents,
    }, {
      where: {
        user_id,
      },
    });
  });

export const updateUserEntry = (user_id, document_details, status, payment_status,
  is_isa = false, is_verified = false) => Documents.update({
  document_details,
  status,
  payment_status,
  is_isa,
  is_verified,
}, { where: { user_id } });
