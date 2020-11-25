const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('rubrics', 'related_rubrics', {
      type: Sequelize.ARRAY(Sequelize.UUID),
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('rubrics', 'related_rubrics', { transaction }),
  ])),
};

export default migration;
