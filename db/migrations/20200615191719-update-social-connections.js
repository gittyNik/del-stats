const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('social_connections', 'user_id', {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('social_connections', 'user_id', Sequelize.UUID, { transaction }),
  ])),
};

export default migration;
