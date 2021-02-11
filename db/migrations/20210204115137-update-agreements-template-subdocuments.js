module.exports = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('agreement_templates', 'subdocuments', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
    qi.addColumn('agreement_templates', 'document_name', {
      type: Sequelize.STRING,
      allowNull: false,
    }, { transaction }),
    qi.removeColumn('agreement_templates', 'document_identifier', { transaction }),
    qi.addColumn('agreement_templates', 'document_identifier',  {
      type: Sequelize.STRING,
      unique: false,
      allowNull: false,
    }, { transaction }),
  ])),

  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('agreement_templates', 'subdocuments', { transaction }),
    qi.removeColumn('agreement_templates', 'document_name', { transaction }),
    // qi.addColumn('agreement_templates', 'document_identifier',  {
    //   type: Sequelize.STRING,
    //   unique: false,
    //   allowNull: false,
    // }, { transaction }),
  ])),
};
