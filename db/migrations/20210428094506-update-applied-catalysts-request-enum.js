const request_status = [
  'internal',
  'external-pending',
  'external-selected',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('cohort_breakouts', 'catalyst_request_status', {
      type: Sequelize.ENUM(...request_status),
      defaultValue: 'internal',
    }, { transaction: t }),

  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('cohort_breakouts', 'catalyst_request_status', { transaction: t }),
  ])),
};
