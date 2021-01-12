const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('documents', 'esign_document_id', {
      type: Sequelize.STRING,
      allowNull: true,
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('documents', 'esign_document_id', { transaction }),
  ])),
};

export default migration;
