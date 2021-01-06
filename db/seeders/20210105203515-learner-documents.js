import uuid from 'uuid/v4';

const documentFactory = (document_name, is_required, document_count, document_category=null) => ({
  document_identifier: document_name,
  is_required,
  document_category,
  document_count,
});

const isa_documents = [
  documentFactory('learner-aadhar', true, 2),
  documentFactory('learner-graduation-certificate', true, 1),
  documentFactory('learner-bank-statement', true, 1),
  documentFactory('learner-pan-card', true, 2, 'learner-option-1'),
  documentFactory('learner-driving-license', true, 2, 'learner-option-1'),
  documentFactory('learner-ration-card', true, 1, 'learner-option-1'),
  documentFactory('learner-voter-id', true, 2, 'learner-option-1'),
  documentFactory('learner-passport', true, 1, 'learner-option-1'),
  documentFactory('learner-post-dated-cheque', true, 1),
  documentFactory('guardian-aadhar', true, 2),
  documentFactory('guardian-bank-statement', false, 1),
  documentFactory('guardian-pan-card', true, 2, 'guardian-option-1'),
  documentFactory('guardian-driving-license', true, 2, 'guardian-option-1'),
  documentFactory('guardian-ration-card', true, 1, 'guardian-option-1'),
  documentFactory('guardian-voter-id', true, 2, 'guardian-option-1'),
  documentFactory('guardian-passport', true, 1, 'guardian-option-1'),
  documentFactory('guardian-income-proof', false, 1),
];

const non_isa_loan_documents = [
  documentFactory('learner-aadhar', true, 2),
  documentFactory('learner-graduation-certificate', true, 1),
  documentFactory('learner-bank-statement', true, 1),
  documentFactory('learner-pan-card', true, 2, 'learner-option-1'),
  documentFactory('learner-driving-license', true, 2, 'learner-option-1'),
  documentFactory('learner-ration-card', true, 1, 'learner-option-1'),
  documentFactory('learner-voter-id', true, 2, 'learner-option-1'),
  documentFactory('learner-passport', true, 1, 'learner-option-1'),

  documentFactory('guardian-aadhar', true, 2),
  documentFactory('guardian-bank-statement', false, 1), // need to finalize
  documentFactory('guardian-pan-card', true, 2, 'guardian-option-1'),
  documentFactory('guardian-driving-license', true, 2, 'guardian-option-1'),
  documentFactory('guardian-ration-card', true, 1, 'guardian-option-1'),
  documentFactory('guardian-voter-id', true, 2, 'guardian-option-1'),
  documentFactory('guardian-passport', true, 1, 'guardian-option-1'),
  documentFactory('guardian-income-proof', false, 1),
];

const non_isa_upfront_documents = [
  documentFactory('learner-aadhar', true, 2),
  documentFactory('learner-graduation-certificate', true, 1),
  documentFactory('learner-pan-card', true, 2, 'learner-option-1'),
  documentFactory('learner-driving-license', true, 2, 'learner-option-1'),
  documentFactory('learner-ration-card', true, 1, 'learner-option-1'),
  documentFactory('learner-voter-id', true, 2, 'learner-option-1'),
  documentFactory('learner-passport', true, 1, 'learner-option-1'),

  documentFactory('guardian-aadhar', true, 2),
  documentFactory('guardian-pan-card', true, 2, 'guardian-option-1'),
  documentFactory('guardian-driving-license', true, 2, 'guardian-option-1'),
  documentFactory('guardian-ration-card', true, 1, 'guardian-option-1'),
  documentFactory('guardian-voter-id', true, 2, 'guardian-option-1'),
  documentFactory('guardian-passport', true, 1, 'guardian-option-1'),
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
};

// console.log(createLearnerDocumentTemplates());

const seeder = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => {
    const addLearnerDocuments = qi.bulkInsert(
      'agreement_templates',
      createLearnerDocumentTemplates(),
      { transaction },
    );
    return Promise.all([addLearnerDocuments])
      .then(() => console.log('Seeded learner documents in agreement_templates table'))
      .catch(err => {
        console.error(err);
        console.error('===============');
        console.error(err.message);
      });
  }),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => {
    return Promise.all([
      qi.bulkDelete('agreement_templates', { is_learner_document: true }, { transaction }),
    ]);
  }),
};

export default seeder;
