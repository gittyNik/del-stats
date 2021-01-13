const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('documents', 'mandate_status', {
      type: Sequelize.JSON,
      allowNull: true,
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('documents', 'mandate_status', { transaction }),
  ])),
};

export default migration;
