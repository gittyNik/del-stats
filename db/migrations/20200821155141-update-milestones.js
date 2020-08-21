module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.addColumn('milestones', 'duration', {
      type: Sequelize.INTEGER,
    }, { transaction: t }),
    queryInterface.addColumn('milestones', 'alias', {
      type: Sequelize.STRING,
    }, { transaction: t }),
  ])),

  down: (queryInterface) => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.removeColumn('milestones', 'duration', { transaction: t }),
    queryInterface.removeColumn('milestones', 'alias', { transaction: t }),
  ])),
};
