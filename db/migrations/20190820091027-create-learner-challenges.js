const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('learner_challenges', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    challenge_id: {
      type: Sequelize.UUID,
      references: { model: 'challenges', key: 'id' },
    },
    learner_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    repo: Sequelize.STRING,
    learner_feedback: Sequelize.TEXT,
    review: Sequelize.TEXT,
    reviewed_by: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('learner_challenges'),
};

export default migration;
