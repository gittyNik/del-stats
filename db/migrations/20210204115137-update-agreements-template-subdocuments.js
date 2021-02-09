module.exports = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('agreement_templates', 'subdocuments', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
    qi.addColumn('agreement_templates', 'document_name', {
      type: Sequelize.STRING,
      allowNull: false,
    }, { transaction }),
  ])),

  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('agreement_templates', 'subdocuments', { transaction }),
    qi.removeColumn('agreement_templates', 'document_name', { transaction }),
  ])),
};
