const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('agreement_templates', 'modified_by', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
    qi.removeColumn('agreement_templates', 'updated_by', { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('agreement_templates', 'updated_by', {
      type: Sequelize.DATE,
    }, { transaction }),
    qi.removeColumn('agreement_templates', 'modified_by', { transaction }),
  ])),
};

export default migration;
