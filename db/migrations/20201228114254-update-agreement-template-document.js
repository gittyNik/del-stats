const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('agreement_templates', 'document_identifier', {
      type: Sequelize.STRING,
      allowNull: false,
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('agreement_templates', 'document_identifier', {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    }, { transaction }),
  ])),
};

export default migration;
