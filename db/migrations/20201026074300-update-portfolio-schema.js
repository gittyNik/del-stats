const HIRING_STATUS = [
  'available', 'currently-unavailable',
  'hired',
];

const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('portfolios', 'resume', Sequelize.JSON, { transaction }),
    qi.addColumn('portfolios', 'hiring_status', {
      type: Sequelize.ENUM(...HIRING_STATUS),
      defaultValue: 'available',
    }, { transaction }),
    qi.addColumn('portfolios', 'tags', {
      type: Sequelize.UUID,
      references: { model: 'tags', key: 'id' },
    }, { transaction }),
    qi.addColumn('portfolios', 'available_time_slots', Sequelize.ARRAY(Sequelize.JSON), { transaction }),
    qi.changeColumn('portfolios', 'learner_id', {
      type: Sequelize.UUID,
      unique: true,
      references: { model: 'users', key: 'id' },
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('portfolios', 'resume', { transaction }),
    qi.removeColumn('portfolios', 'hiring_status', { transaction }),
    qi.removeColumn('portfolios', 'tags', { transaction }),
    qi.removeColumn('portfolios', 'available_time_slots', { transaction }),
    qi.changeColumn('portfolios', 'learner_id', {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    }, { transaction }),
  ])),
};

export default migration;
