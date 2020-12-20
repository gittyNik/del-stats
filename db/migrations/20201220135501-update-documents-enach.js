const replaceEnum = require('../../src/util/replaceEnum.js');

const DOCUMENT_STATUS = ['requested', 'verifying', 'rejected', 'change-requested', 'verified', 'completed'];
const OLD_DOCUMENT_STATUS = ['requested', 'signed', 'payment-pending', 'payment-partial', 'payment-complete'];

module.exports = {
  up: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'documents',
    columnName: 'status',
    newValues: DOCUMENT_STATUS,
    defaultValue: 'requested',
    enumName: 'enum_documents_status',
  }),

  down: (queryInterface) => replaceEnum({
    queryInterface,
    tableName: 'documents',
    columnName: 'status',
    newValues: OLD_DOCUMENT_STATUS,
    enumName: 'enum_documents_status',
  }),
};
