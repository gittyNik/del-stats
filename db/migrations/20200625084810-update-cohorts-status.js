export const COHORT_STATUS = [
  'upcoming',
  'live',
  'completed',
  'deferred',
  'reallocated',
];

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('cohorts', 'status', {
    type: Sequelize.ENUM(...COHORT_STATUS),
    defaultValue: 'upcoming',
  }),
  down: queryInterface => queryInterface.removeColumn('cohorts', 'status'),
};

export default migration;
