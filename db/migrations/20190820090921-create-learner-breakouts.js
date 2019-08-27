const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('learner_breakouts', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    cohort_breakout_id: {
      type: Sequelize.UUID,
      references: { model: 'cohort_breakouts', key: 'id' },
    },
    learner_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    learner_notes: Sequelize.TEXT,
    learner_feedback: Sequelize.TEXT,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('learner_breakouts'),
};

export default migration;
