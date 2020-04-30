const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('documents', 'user_id', {
      type: Sequelize.UUID,
      unique: true,
      references: { model: 'users', key: 'id' },
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('documents', 'user_id', {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    }, { transaction }),
  ])),
};

export default migration;
