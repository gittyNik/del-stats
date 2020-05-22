const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('review_slots', 'slot_order', {
      type: Sequelize.INTEGER,
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('review_slots', 'slot_order', { transaction }),
  ])),
};


export default migration;
