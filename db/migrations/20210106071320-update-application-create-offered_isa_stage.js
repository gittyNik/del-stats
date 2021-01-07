const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('applications', 'offered_isa', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('applications', 'offered_isa', { transaction }),
  ])),
};

export default migration;
