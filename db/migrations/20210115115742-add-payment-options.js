const PAYMENT_FREQUENCIES = [
  'Adhoc',
  'IntraDay',
  'Daily',
  'Weekly',
  'Monthly',
  'BiMonthly',
  'Quarterly',
  'Semiannually',
  'Yearly',
];

const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('payment_details', 'is_recurring', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction }),
    qi.addColumn('payment_details', 'frequency', {
      type: Sequelize.ENUM(...PAYMENT_FREQUENCIES),
      defaultValue: 'Adhoc',
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('payment_details', 'is_recurring', { transaction }),
    qi.removeColumn('payment_details', 'frequency', { transaction }),
  ])),
};

export default migration;
