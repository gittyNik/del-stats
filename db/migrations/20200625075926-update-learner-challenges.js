const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('learner_challenges', 'created_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }, { transaction }),
    qi.changeColumn('learner_challenges', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('learner_challenges', 'created_at', Sequelize.DATE, { transaction }),
    qi.changeColumn('learner_challenges', 'updated_at', Sequelize.DATE, { transaction }),
  ])),
};

export default migration;
