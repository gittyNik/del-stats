import Sequelize, { NOW } from 'sequelize';
import uuid from 'uuid/v4';
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
  subdocuments: {
    type: Sequelize.ARRAY(Sequelize.JSON),
  },
  document_name: {
    type: Sequelize.STRING,
    allowNull: false,
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

// delete from here

const documentFactory = (
  document_identifier, document_name, is_required,
  document_count, subdocuments,
  document_category = null,
) => ({
  document_identifier,
  document_name,
  is_required,
  document_category,
  document_count,
  subdocuments,
});

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

const isa_documents = [
  documentFactory('learner-aadhar', 'Aadhar Card', true, 2, [{
    document_identifier: 'learner-aadhar-front',
    document_name: 'Aadhar Front',
  }, {
    document_identifier: 'learner-aadhar-back',
    document_name: 'Aadhar Back',
  }]),
  documentFactory('learner-graduation-certificate', 'Graduation Certificate', true, 1, [{
    document_identifier: 'learner-graduation-certificate',
    document_name: 'Upload',
  }]),
  documentFactory('learner-bank-statement', 'Bank Statement', true, 1, [{
    document_identifier: 'learner-bank-statement',
    document_name: 'Upload',
  }]),
  documentFactory('learner-pan-card', 'Pan Card', true, 2, [{
    document_identifier: 'learner-PAN-card-front',
    document_name: 'Pan Front',
  }, {
    document_identifier: 'learner-PAN-card-back',
    document_name: 'Pan Back',
  }], 'learner-option-1'),
  documentFactory('learner-driving-license', 'Driving License', true, 2, [{
    document_identifier: 'learner-driving-license-front',
    document_name: 'Driving License Front',
  }, {
    document_identifier: 'learner-driving-license-back',
    document_name: 'Driving License Back',
  }], 'learner-option-1'),
  documentFactory('learner-ration-card', 'Ration Card', true, 2, [{
    document_identifier: 'learner-ration-card-front',
    document_name: 'Ration Card Front',
  }, {
    document_identifier: 'learner-ration-card-back',
    document_name: 'Ration Card Back',
  }], 'learner-option-1'),
  documentFactory('learner-voter-id', 'Voter Card', true, 2, [{
    document_identifier: 'learner-voter-ID-front',
    document_name: 'Voter ID Front',
  }, {
    document_identifier: 'learner-voter-ID-back',
    document_name: 'Voter ID Back',
  }], 'learner-option-1'),
  documentFactory('learner-passport', 'Passport', true, 1, [{
    document_identifier: 'learner-passport',
    document_name: 'Passport',
  }], 'learner-option-1'),
  documentFactory('learner-post-dated-cheque', 'Post Dated Cheque', true, 1, [{
    document_identifier: 'learner-post-dated-cheque',
    document_name: 'Post Dated Cheque',
  }]),
  documentFactory('guardian-aadhar', 'Aadhar Card', true, 2, [{
    document_identifier: 'guardian-aadhar-front',
    document_name: 'Aadhar Front',
  }, {
    document_identifier: 'guardian-aadhar-back',
    document_name: 'Aadhar Back',
  }]),
  documentFactory('guardian-bank-statement', 'Bank Statement', false, 1, [{
    document_identifier: 'guardian-bank-statement',
    document_name: 'Bank Statement',
  }]),
  documentFactory('guardian-pan-card', 'Pan Card', true, 2, [{
    document_identifier: 'guardian-PAN-card-front',
    document_name: 'Pan Front',
  }, {
    document_identifier: 'guardian-PAN-card-back',
    document_name: 'Pan Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-driving-license', 'Driving License', true, 2, [{
    document_identifier: 'guardian-driving-license-front',
    document_name: 'Driving License Front',
  }, {
    document_identifier: 'guardian-driving-license-back',
    document_name: 'Driving License Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-ration-card', 'Ration Card', true, 2, [{
    document_identifier: 'guardian-ration-card-front',
    document_name: 'Ration Card Front',
  }, {
    document_identifier: 'guardian-ration-card-back',
    document_name: 'Ration Card Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-voter-id', 'Voter Card', true, 2, [{
    document_identifier: 'guardian-voter-ID-front',
    document_name: 'Voter ID Front',
  }, {
    document_identifier: 'guardian-voter-ID-back',
    document_name: 'Voter ID Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-passport', 'Passport', true, 1, [{
    document_identifier: 'guardian-passport',
    document_name: 'Passport',
  }], 'guardian-option-1'),
  documentFactory('guardian-income-proof', 'Income Proof', false, 1, [{
    document_identifier: 'guardian-income-proof',
    document_name: 'Income Proof',
  }]),
];

const non_isa_loan_documents = [
  documentFactory('learner-aadhar', 'Aadhar Card', true, 2, [{
    document_identifier: 'learner-aadhar-front',
    document_name: 'Aadhar Front',
  }, {
    document_identifier: 'learner-aadhar-back',
    document_name: 'Aadhar Back',
  }]),
  documentFactory('learner-graduation-certificate', 'Graduation Certificate', true, 1, [{
    document_identifier: 'learner-graduation-certificate',
    document_name: 'Upload',
  }]),
  documentFactory('learner-bank-statement', 'Bank Statement', true, 1, [{
    document_identifier: 'learner-bank-statement',
    document_name: 'Upload',
  }]),
  documentFactory('learner-pan-card', 'Pan Card', true, 2, [{
    document_identifier: 'learner-PAN-card-front',
    document_name: 'Pan Front',
  }, {
    document_identifier: 'learner-PAN-card-back',
    document_name: 'Pan Back',
  }], 'learner-option-1'),
  documentFactory('learner-driving-license', 'Driving License', true, 2, [{
    document_identifier: 'learner-driving-license-front',
    document_name: 'Driving License Front',
  }, {
    document_identifier: 'learner-driving-license-back',
    document_name: 'Driving License Back',
  }], 'learner-option-1'),
  documentFactory('learner-ration-card', 'Ration Card', true, 2, [{
    document_identifier: 'learner-ration-card-front',
    document_name: 'Ration Card Front',
  }, {
    document_identifier: 'learner-ration-card-back',
    document_name: 'Ration Card Back',
  }], 'learner-option-1'),
  documentFactory('learner-voter-id', 'Voter Card', true, 2, [{
    document_identifier: 'learner-voter-ID-front',
    document_name: 'Voter ID Front',
  }, {
    document_identifier: 'learner-voter-ID-back',
    document_name: 'Voter ID Back',
  }], 'learner-option-1'),
  documentFactory('learner-passport', 'Passport', true, 1, [{
    document_identifier: 'learner-passport',
    document_name: 'Passport',
  }], 'learner-option-1'),

  documentFactory('guardian-aadhar', 'Aadhar Card', true, 2, [{
    document_identifier: 'guardian-aadhar-front',
    document_name: 'Aadhar Front',
  }, {
    document_identifier: 'guardian-aadhar-back',
    document_name: 'Aadhar Back',
  }]),
  documentFactory('guardian-bank-statement', 'Bank Statement', false, 1, [{
    document_identifier: 'guardian-bank-statement',
    document_name: 'Bank Statement',
  }]),
  documentFactory('guardian-pan-card', 'Pan Card', true, 2, [{
    document_identifier: 'guardian-PAN-card-front',
    document_name: 'Pan Front',
  }, {
    document_identifier: 'guardian-PAN-card-back',
    document_name: 'Pan Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-driving-license', 'Driving License', true, 2, [{
    document_identifier: 'guardian-driving-license-front',
    document_name: 'Driving License Front',
  }, {
    document_identifier: 'guardian-driving-license-back',
    document_name: 'Driving License Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-ration-card', 'Ration Card', true, 2, [{
    document_identifier: 'guardian-ration-card-front',
    document_name: 'Ration Card Front',
  }, {
    document_identifier: 'guardian-ration-card-back',
    document_name: 'Ration Card Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-voter-id', 'Voter Card', true, 2, [{
    document_identifier: 'guardian-voter-ID-front',
    document_name: 'Voter ID Front',
  }, {
    document_identifier: 'guardian-voter-ID-back',
    document_name: 'Voter ID Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-passport', 'Passport', true, 1, [{
    document_identifier: 'guardian-passport',
    document_name: 'Passport',
  }], 'guardian-option-1'),
  documentFactory('guardian-income-proof', 'Income Proof', false, 1, [{
    document_identifier: 'guardian-income-proof',
    document_name: 'Income Proof',
  }]),
];

const non_isa_upfront_documents = [
  documentFactory('learner-aadhar', 'Aadhar Card', true, 2, [{
    document_identifier: 'learner-aadhar-front',
    document_name: 'Aadhar Front',
  }, {
    document_identifier: 'learner-aadhar-back',
    document_name: 'Aadhar Back',
  }]),
  documentFactory('learner-graduation-certificate', 'Graduation Certificate', true, 1, [{
    document_identifier: 'learner-graduation-certificate',
    document_name: 'Upload',
  }]),
  documentFactory('learner-pan-card', 'Pan Card', true, 2, [{
    document_identifier: 'learner-PAN-card-front',
    document_name: 'Pan Front',
  }, {
    document_identifier: 'learner-PAN-card-back',
    document_name: 'Pan Back',
  }], 'learner-option-1'),
  documentFactory('learner-driving-license', 'Driving License', true, 2, [{
    document_identifier: 'learner-driving-license-front',
    document_name: 'Driving License Front',
  }, {
    document_identifier: 'learner-driving-license-back',
    document_name: 'Driving License Back',
  }], 'learner-option-1'),
  documentFactory('learner-ration-card', 'Ration Card', true, 2, [{
    document_identifier: 'learner-ration-card-front',
    document_name: 'Ration Card Front',
  }, {
    document_identifier: 'learner-ration-card-back',
    document_name: 'Ration Card Back',
  }], 'learner-option-1'),
  documentFactory('learner-voter-id', 'Voter Card', true, 2, [{
    document_identifier: 'learner-voter-ID-front',
    document_name: 'Voter ID Front',
  }, {
    document_identifier: 'learner-voter-ID-back',
    document_name: 'Voter ID Back',
  }], 'learner-option-1'),
  documentFactory('learner-passport', 'Passport', true, 1, [{
    document_identifier: 'learner-passport',
    document_name: 'Passport',
  }], 'learner-option-1'),
  documentFactory('guardian-aadhar', 'Aadhar Card', true, 2, [{
    document_identifier: 'guardian-aadhar-front',
    document_name: 'Aadhar Front',
  }, {
    document_identifier: 'guardian-aadhar-back',
    document_name: 'Aadhar Back',
  }]),
  documentFactory('guardian-pan-card', 'Pan Card', true, 2, [{
    document_identifier: 'guardian-PAN-card-front',
    document_name: 'Pan Front',
  }, {
    document_identifier: 'guardian-PAN-card-back',
    document_name: 'Pan Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-driving-license', 'Driving License', true, 2, [{
    document_identifier: 'guardian-driving-license-front',
    document_name: 'Driving License Front',
  }, {
    document_identifier: 'guardian-driving-license-back',
    document_name: 'Driving License Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-ration-card', 'Ration Card', true, 2, [{
    document_identifier: 'guardian-ration-card-front',
    document_name: 'Ration Card Front',
  }, {
    document_identifier: 'guardian-ration-card-back',
    document_name: 'Ration Card Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-voter-id', 'Voter Card', true, 2, [{
    document_identifier: 'guardian-voter-ID-front',
    document_name: 'Voter ID Front',
  }, {
    document_identifier: 'guardian-voter-ID-back',
    document_name: 'Voter ID Back',
  }], 'guardian-option-1'),
  documentFactory('guardian-passport', 'Passport', true, 1, [{
    document_identifier: 'guardian-passport',
    document_name: 'Passport',
  }], 'guardian-option-1'),
];

const createLearnerDocumentTemplates = () => {
  const isa = isa_documents.map(document => {
    document.id = uuid();
    document.program = 'tep';
    document.is_learner_document = true;
    document.is_isa = true;
    return document;
  });
  const non_isa_loan = non_isa_loan_documents.map(document => {
    document.id = uuid();
    document.program = 'tep';
    document.is_learner_document = true;
    document.is_isa = false;
    document.non_isa_type = 'loan';
    return document;
  });
  const non_isa_upfront = non_isa_upfront_documents.map(document => {
    document.id = uuid();
    document.program = 'tep';
    document.is_learner_document = true;
    document.is_isa = false;
    document.non_isa_type = 'upfront';
    return document;
  });
  return [...isa, ...non_isa_loan, ...non_isa_upfront];
  // return [...isa];
};

export const AgreementTemplatesSeed = () => AgreementTemplates
  .bulkCreate(createLearnerDocumentTemplates());
