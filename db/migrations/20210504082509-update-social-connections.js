const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('social_connections', 'id', {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    }, { transaction }),
    qi.changeColumn('social_connections', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('social_connections', 'id', {
      type: Sequelize.UUID,
      primaryKey: true,
    }, { transaction }),
    qi.changeColumn('social_connections', 'updated_at', Sequelize.DATE, { transaction }),
  ])),
};

export default migration;
