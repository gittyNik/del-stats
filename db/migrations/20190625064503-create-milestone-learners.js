const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('milestone_learners', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    cohort_milestone_id: {
      type: Sequelize.UUID,
      references: { model: 'cohort_milestones', key: 'id' },
    },
    learner_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    review: Sequelize.TEXT,
    reviewed_by: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    learner_feedback: Sequelize.TEXT,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('milestone_learners'),
};

export default migration;
