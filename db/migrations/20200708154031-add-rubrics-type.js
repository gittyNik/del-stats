const RUBRIC_TYPE = [
  'milestone',
  'core-phase',
  'focus-phase',
];

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('rubrics', 'type', {
    type: Sequelize.ENUM(...RUBRIC_TYPE),
    defaultValue: 'milestone',
  }),
  down: queryInterface => queryInterface.removeColumn('rubrics', 'type'),
};

export default migration;
