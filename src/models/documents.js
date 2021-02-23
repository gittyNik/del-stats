import Sequelize from 'sequelize';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import db from '../database';
import { AgreementTemplates } from './agreements_template';

export const document_status = [
  'requested',
  'verifying',
  'rejected',
  'change-requested',
  'verified',
  'completed',
];

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

export const mandatory = {
  AADHAR_FRONT: 'aadhar-front',
  AADHAR_BACK: 'aadhar-back',
  BANK_STATEMENT: 'bank-statement',
  GRADUATION_CERTIFICATE: 'graduation-certificate',
  PROOF_OF_INCOME: 'proof-of-income',
};

export const learner_options_front = {
  LEARNER_PAN_CARD_FRONT: 'learner-PAN-card-front',
  LEARNER_DL_FRONT: 'learner-driving-license-front',
  LEARNER_RATION_CARD_FRONT: 'learner-ration-card-front',
  LEARNER_VOTER_ID_FRONT: 'learner-voter-ID-front',
  LEARNER_PASSPORT: 'learner-passport',
};

export const learner_options_back = {
  LEARNER_PAN_CARD_BACK: 'learner-PAN-card-back',
  LEARNER_DL_BACK: 'learner-driving-license-back',
  LEARNER_RATION_CARD_BACK: 'learner-ration-card-front',
  LEARNER_VOTER_ID_BACK: 'learner-voter-ID-back',
};

export const guardian_options_front = {
  GUARDIAN_PAN_CARD_FRONT: 'guardian-PAN-card-front',
  GUARDIAN_DL_FRONT: 'guardian-driving-license-front',
  GUARDIAN_RATION_CARD_FRONT: 'guardian-ration-card-front',
  GUARDIAN_VOTER_ID_FRONT: 'guardian-voter-ID-front',
  GUARDIAN_PASSPORT: 'guardian-passport',
};

export const guardian_options_back = {
  GUARDIAN_PAN_CARD_BACK: 'guardian-PAN-card-back',
  GUARDIAN_DL_BACK: 'guardian-driving-license-back',
  GUARDIAN_RATION_CARD_BACK: 'guardian-ration-card-front',
  GUARDIAN_VOTER_ID_BACK: 'guardian-voter-ID-back',
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

export const createOrUpdateUserDocument = (document, user_documents) => {
  if (typeof document === 'undefined') {
    return empty_user_documents();
  }
  const {
    document_name, is_verified, document_path, details,
  } = document;
  const empty = user_documents || empty_user_documents();
  const optional_ud = empty.find(_ud => {
    if (_ud.list) {
      return _ud.list.includes(document_name);
    }
    return false;
  });
  if (optional_ud) {
    optional_ud.document_name = document_name || optional_ud.document_name;
    optional_ud.is_verified = is_verified || false;
    optional_ud.document_path = document_path || optional_ud.document_path;
    return empty;
  }
  const ud = empty.find(_ud => _ud.document_name === document_name);
  ud.is_verified = is_verified || false;
  ud.document_path = document_path || ud.document_path;
  ud.details = details || { comment: '', updated_by: '', updated_at: '' };
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
    // Used for storing Esign details
    type: Sequelize.JSON,
    allowNull: true,
  },
  esign_document_id: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  mandate_details: {
    // Used to store mandate creation details
    type: Sequelize.JSON,
    allowNull: true,
  },
  mandate_status: {
    // Update status and stage for mandate
    type: Sequelize.JSON,
    allowNull: true,
  },
  mandate_id: {
    type: Sequelize.STRING,
  },
  nach_debit_id: {
    type: Sequelize.STRING,
  },
  nach_debit_details: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
  status: {
    type: Sequelize.ENUM(...document_status),
    defaultValue: 'requested',
    allowNull: false,
  },
  updated_by: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
  user_documents: {
    // Used to store user document information
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

export const getDocumentsByUser = user_id => Documents.findOne(
  {
    where: { user_id },
    raw: true,
  },
);

export const getDocumentsByEsignId = esign_document_id => Documents.findOne(
  {
    where: { esign_document_id },
    raw: true,
  },
);

export const updateEsignDetailsForLearner = ({
  esign_document_id,
  document_details,
}) => Documents.update({
  document_details,
}, {
  where: {
    esign_document_id,
  },
  returning: true,
});

export const updateMandateDetailsForLearner = ({ mandate_id, mandate_status }) => Documents.update({
  mandate_status,
}, {
  where: {
    mandate_id,
  },
  returning: true,
});

export const updateDebitDetailsForLearner = ({
  nach_debit_id,
  nach_debit_details,
}) => Documents.findOne({
  where: {
    nach_debit_id,
  },
})
  .then((learnerDocument) => {
    if (_.isEmpty(learnerDocument)) {
      throw Error('Nach debit details not present in DB');
    }

    if (learnerDocument.nach_debit_details === null) {
      learnerDocument.nach_debit_details = [];
    }
    learnerDocument.nach_debit_details.push(nach_debit_details);

    return learnerDocument.update({
      nach_debit_details: learnerDocument.nach_debit_details,
    }, {
      where: {
        nach_debit_id,
      },
      returning: true,
    });
  });

export const createUserEntry = ({
  user_id, document_details, status, payment_status,
  is_isa = false, is_verified = false,
  esign_document_id,
}) => Documents.findOne({
  where: {
    user_id,
  },
})
  .then((userDocuments) => {
    if (_.isEmpty(userDocuments)) {
      return Documents.create({
        esign_document_id,
        user_id,
        document_details,
        status,
        payment_status,
        is_isa,
        is_verified,
        // todo
        // user_documents: createOrUpdateUserDocument(user_document),
      });
    }

    return userDocuments.update({
      esign_document_id,
      document_details,
      status,
      payment_status,
      is_isa,
      is_verified,
      // todo
      // user_documents: createOrUpdateUserDocument(user_document),
    }, {
      where: {
        user_id,
      },
    });
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

      return Documents.create({
        id: uuid(),
        user_id,
        user_documents: document,
      });
      // return createUserEntry({
      //   user_id,
      //   user_document: document,
      // }).then(d => d.get({ plain: true }));
    }
    return Documents.update({
      user_documents: document,
    }, {
      where: {
        user_id,
      },
    });

    // const { document_name, is_verified, document_path } = document;

    // return learnerDocument.update({
    //   user_documents: createOrUpdateUserDocument(document, learnerDocument.user_documents),
    // }, {
    //   where: {
    //     user_id,
    //   },
    // })
    //   .then(d => d.get({ plain: true }));
  });

export const verifySingleUserDocument = async (
  user_id,
  document_name,
  is_verified,
  comment,
  updated_by,
) => {
  const documentRow = await getDocumentsByUser(user_id);
  // const
  const updated_user_documents = createOrUpdateUserDocument(
    {
      document_name,
      is_verified,
      details: { comment, updated_by, updated_at: new Date() },
    },
    documentRow[0].user_documents,
  );
  return Documents.update({
    user_documents: updated_user_documents,
  }, {
    where: { user_id },
    returning: true,
  });
};
// export const updateUserEntry = (user_id, document_details, status, payment_status,
//   is_isa = false, is_verified = false) => Documents.update({
//   document_details,
//   status,
//   payment_status,
//   is_isa,
//   is_verified,
// }, { where: { user_id } });

export const getLearnerDocumentsJSON = async ({ program, is_isa, non_isa_type }) => {
  const whereObject = {
    is_learner_document: true,
    is_isa,
    program: program || 'tep',
  };
  if (typeof non_isa_type !== 'undefined') {
    whereObject.non_isa_type = non_isa_type;
    delete whereObject.is_isa;
  }

  const rawLD = await AgreementTemplates.findAll({
    attributes: ['document_identifier', 'document_name', 'document_category', 'is_required', 'document_count', 'subdocuments'],
    where: whereObject,
    raw: true,
  });
  // return rawLD;
  const data = [];
  rawLD.map(r => {
    // this document is added to a list of  'select any one or n documents category`
    if (r.document_category !== null && typeof r.document_category !== 'undefined') {
      const category = data.find(d => d.document_name === r.document_category);
      // category already exists
      if (typeof category === 'object' || typeof category !== 'undefined') {
        delete r.is_required;
        delete r.document_category;
        category.list.push({
          document_name: r.document_identifier,
          display_name: r.document_name,
          document_count: r.document_count,
          documents: r.subdocuments.map(sd => ({
            document_name: sd.document_identifier,
            display_name: sd.document_name,
            document_path: '',
            is_required: sd.is_required,
            is_verified: false,
          })),
        });
      } else { // creating a category and updating the list with current document.
        data.push({
          document_name: r.document_category,
          display_name: 'Optional Document(s)',
          is_required: true,
          is_verified: false,
          // select any n documents from the list. where n is the number represented in the string
          // ex: in `learner-option-1` : select any one document from the cateogry.
          document_count: r.document_category.split('-').pop(),
          details: {
            comments: '',
            updated_by: '',
            updated_at: '',
          },
          list: [
            {
              document_name: r.document_identifier,
              display_name: r.document_name,
              document_count: r.document_count,
              documents: r.subdocuments.map(sd => ({
                document_name: sd.document_identifier,
                display_name: sd.document_name,
                document_path: '',
                is_required: sd.is_required,
                is_verified: false,
              })),
            }],
          selected: '',
        });
      }
    } else {
      data.unshift({
        document_name: r.document_identifier,
        display_name: r.document_name,
        document_count: r.document_count,
        is_required: true,
        is_verified: false,
        details: {
          comments: '',
          updated_by: '',
          updated_at: '',
        },
        documents: r.subdocuments.map(sd => ({
          document_name: sd.document_identifier,
          display_name: sd.document_name,
          document_path: '',
          is_required: sd.is_required,
          is_verified: false,
        })),
      });
    }
    return r;
  });
  return data;
};

export const updateUserEntry = ({
  user_id, document_details, status, payment_status,
  is_isa = false, is_verified = false,
  mandate_id,
  mandate_status,
  nach_debit_id,
  nach_debit_details,
  mandate_details,
  esign_document_id,
}) => Documents.findOne({
  where: {
    user_id,
  },
})
  .then((learnerDocument) => {
    if (_.isEmpty(learnerDocument)) {
      return null;
    }

    if (nach_debit_details) {
      if (learnerDocument.nach_debit_details) {
        learnerDocument.nach_debit_details.push(nach_debit_details);
      } else {
        learnerDocument.nach_debit_details = [];
        learnerDocument.nach_debit_details.push(nach_debit_details);
      }
    }

    return learnerDocument.update({
      esign_document_id,
      document_details,
      status,
      payment_status,
      is_isa,
      is_verified,
      mandate_id,
      mandate_status,
      nach_debit_id,
      mandate_details,
      nach_debit_details: learnerDocument.nach_debit_details,
    }, {
      where: {
        user_id,
      },
    });
  });
