const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('applications', 'payment_option_selected', {
      type: Sequelize.UUID,
      references: { model: 'payment_details', key: 'id' },
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('applications', 'payment_option_selected', { transaction }),
  ])),
};

export default migration;
