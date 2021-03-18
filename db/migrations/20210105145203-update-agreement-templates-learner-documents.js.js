const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(t => Promise.all([
    qi.addColumn('agreement_templates', 'is_learner_document', {
      type: Sequelize.BOOLEAN,
      default: false,
    }, { transaction: t }),
    qi.addColumn('agreement_templates', 'non_isa_type', {
      type: Sequelize.STRING,
      allowNull: true,
    }, { transaction: t }),
    qi.addColumn('agreement_templates', 'document_category', {
      type: Sequelize.STRING,
      allowNull: true,
    }, { transaction: t }),
    qi.addColumn('agreement_templates', 'is_required', {
      type: Sequelize.BOOLEAN,
    }, { transaction: t }),
    qi.addColumn('agreement_templates', 'document_count', {
      type: Sequelize.INTEGER,
      default: 1,
    }, { transaction: t }),
    qi.removeConstraint('agreement_templates', 'agreement_templates_document_identifier_key', { transaction: t }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('agreement_templates', 'is_learner_document', { transaction }),
    qi.removeColumn('agreement_templates', 'non_isa_type', { transaction }),
    qi.removeColumn('agreement_templates', 'document_category', { transaction }),
    qi.removeColumn('agreement_templates', 'is_required', { transaction }),
    qi.removeColumn('agreement_templates', 'document_count', { transaction }),
    qi.changeColumn('agreement_templates', 'document_identifier', {
      type: Sequelize.STRING,
      unique: true,
    }, { transaction }),
  ])),
};

export default migration;
