export const AVAILABLE_USER_STATUS = [
  'medical emergency',
  'dropout',
  'moved',
  'respawning core phase',
  'respawning focus phase',
  'irregular',
  'focus phase',
  'core phase',
  'frontend',
  'backend',
  'admission terminated',
  'long leave',
  'joining later',
  'prefers hindi',
  'back after absence',
];

const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('users', 'status', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    }, { transaction }),
    qi.addColumn('users', 'status_reason', {
      type: Sequelize.ARRAY(Sequelize.JSON),
      defaultValue: [],
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('users', 'status', { transaction }),
    qi.removeColumn('users', 'status_reason', { transaction }),
  ])),
};

export default migration;
