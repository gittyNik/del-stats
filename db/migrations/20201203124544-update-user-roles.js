const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('users', 'roles', {
      type: Sequelize.ARRAY(Sequelize.STRING),
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('users', 'roles', { transaction }),
  ])),
};

export default migration;
