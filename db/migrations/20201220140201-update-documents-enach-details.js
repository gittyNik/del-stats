const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('documents', 'mandate_details', {
      type: Sequelize.JSON,
      allowNull: true,
    }, { transaction }),
    qi.addColumn('documents', 'mandate_id', {
      type: Sequelize.STRING,
    }, { transaction }),
    qi.addColumn('documents', 'nach_debit_id', {
      type: Sequelize.STRING,
    }, { transaction }),
    qi.addColumn('documents', 'nach_debit_details', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('documents', 'mandate_details', { transaction }),
    qi.removeColumn('documents', 'mandate_id', { transaction }),
    qi.removeColumn('documents', 'nach_debit_id', { transaction }),
    qi.removeColumn('documents', 'nach_debit_details', { transaction }),
  ])),
};

export default migration;
