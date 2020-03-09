const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('breakout_templates', 'cohort_duration', Sequelize.INTEGER, { transaction }),
    qi.addColumn('breakout_templates', 'program_id', {
      type: Sequelize.STRING,
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('breakout_templates', 'cohort_duration', { transaction }),
    qi.removeColumn('breakout_templates', 'program_id', { transaction }),
  ])),
};


export default migration;
