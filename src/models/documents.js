import Sequelize from 'sequelize';
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
  esign_document_id: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  mandate_details: {
    type: Sequelize.JSON,
    allowNull: true,
  },
  mandate_status: {
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
  is_isa = false, is_verified = false, user_document,
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
      return createUserEntry({
        user_id,
        user_document: document,
      }).then(d => d.get({ plain: true }));
    }
    // const { document_name, is_verified, document_path } = document;

    return learnerDocument.update({
      user_documents: createOrUpdateUserDocument(document, learnerDocument.user_documents),
    }, {
      where: {
        user_id,
      },
    })
      .then(d => d.get({ plain: true }));
  });

export const verifySingleUserDocument = async (
  user_id,
  document_name,
  is_verified,
  comment,
  updated_by) => {
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
  return data;
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
    attributes: [['document_identifier', 'document_name'], 'document_category', 'is_required', 'document_count'],
    where: whereObject,
    raw: true,
  });

  const data = [];
  rawLD.map(r => {
    // this document is added to a list of  'select any one or n documents category`
    if (r.document_category !== null && typeof r.document_category !== 'undefined') {
      const category = data.find(d => d.document_name === r.document_category);
      // category already exists
      if (typeof category === 'object' || typeof category !== 'undefined') {
        delete r.is_required;
        delete r.document_category;
        category.list.push(r);
      } else { // creating a category and updating the list with current document.
        data.push({
          document_name: r.document_category,
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
          list: [{
            document_name: r.document_name,
            document_count: r.document_count,
            document_path: [],
          }],
          selected: '',
        });
      }
    } else {
      delete r.document_category;
      r.document_path = [];
      r.is_verified = false;
      r.details = {
        comments: '',
        updated_by: '',
        updated_at: '',
      };
      data.push(r);
    }
  })
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
