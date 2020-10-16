const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('review_slots', 'week', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('review_slots', 'week', {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    }, { transaction }),
  ])),
};

export default migration;
