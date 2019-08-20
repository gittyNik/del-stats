const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('milestone_learner_teams', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
    },
    cohort_milestone_id: {
      type: Sequelize.UUID,
      references: { model: 'cohort_milestones', key: 'id' },
    },
    learners: Sequelize.ARRAY(Sequelize.UUID),
    github_repo_link: Sequelize.STRING,
    product_demo_link: Sequelize.STRING,
    review: Sequelize.TEXT,
    reviewed_by: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('milestone_learner_teams'),
};

export default migration;
