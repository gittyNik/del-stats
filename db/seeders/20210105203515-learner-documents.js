import uuid from 'uuid/v4';

const documentFactory = (document_identifier, document_name, is_required, document_count, subdocuments, document_category = null) => ({
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

// console.log(createLearnerDocumentTemplates());

const seeder = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => {
    console.log(createLearnerDocumentTemplates()[0].subdocuments);
    const addLearnerDocuments = qi.bulkInsert(
      'agreement_templates',
      createLearnerDocumentTemplates(),
      { transaction },
      // { subdocuments: { type: new Sequelize.JSON() } },
    );

    return Promise.all([addLearnerDocuments])
      .then(() => console.log('Seeded learner documents in agreement_templates table'))
      .catch(err => {
        // console.error(createLearnerDocumentTemplates());
        console.error('===============');
        console.error(err.message);
      });
  }),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.bulkDelete('agreement_templates', { is_learner_document: true }, { transaction }),
  ])),
};

export default seeder;
