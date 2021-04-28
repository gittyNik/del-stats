
const request_status = [
  'applied',
  'accepted',
  'rejected',
  'internal',
];

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('cohort_breakout_applied_catalysts', 'status', { transaction: t }),
    queryInterface.removeColumn('cohort_breakout_applied_catalysts', 'updated_by', { transaction: t }),
    queryInterface.addColumn('cohort_breakouts', 'catalyst_request_status', {
      type: Sequelize.ENUM(...request_status),
      defaultValue: 'internal',
    }, { transaction: t }),

  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('cohort_breakout_applied_catalysts', 'status', Sequelize.ENUM(...request_status), { transaction: t }),
    queryInterface.addColumn('cohort_breakout_applied_catalysts', 'updated_by', {
      type: Sequelize.ARRAY(Sequelize.UUID),
    }, { transaction: t }),
    queryInterface.removeColumn('cohort_breakouts', 'catalyst_request_status', { transaction: t }),
  ])),
};
