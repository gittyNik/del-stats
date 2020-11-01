const migration = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('portfolios', 'showcase_projects', { transaction: t }),
    queryInterface.addColumn('portfolios', 'showcase_projects', { type: Sequelize.ARRAY(Sequelize.JSON) }, { transaction: t }),
  ])),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('portfolios', 'showcase_projects', { transaction: t }),
    queryInterface.addColumn('portfolios', 'showcase_projects', Sequelize.ARRAY(Sequelize.STRING), { transaction: t }),
  ])),
};

export default migration;
