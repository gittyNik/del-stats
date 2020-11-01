const migration = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.changeColumn('portfolios', 'showcase_projects', { type: Sequelize.ARRAY(Sequelize.JSON) }, { transaction: t }),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.changeColumn('portfolios', 'showcase_projects', { type: Sequelize.ARRAY(Sequelize.STRING) }, { transaction: t }),
  ])),
};

export default migration;
