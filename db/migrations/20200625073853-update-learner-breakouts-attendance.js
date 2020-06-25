const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('learner_breakouts', 'attendance', {
      type: Sequelize.BOOLEAN,
      default: false,
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('learner_breakouts', 'attendance', Sequelize.BOOLEAN, { transaction }),
  ])),
};

export default migration;
