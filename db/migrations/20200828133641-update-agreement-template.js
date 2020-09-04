const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('agreement_templates', 'updated_by', {
      type: Sequelize.ARRAY(Sequelize.JSON),
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('agreement_templates', 'updated_by', Sequelize.DATE, { transaction }),
  ])),
};

export default migration;
