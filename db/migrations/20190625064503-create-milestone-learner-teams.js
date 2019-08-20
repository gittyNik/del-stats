const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('milestone_learner_teams', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    team_id: {
      type: Sequelize.UUID,
      references: { model: 'teams', key: 'id' },
    },
    milestone_id: {
      type: Sequelize.UUID,
      references: { model: 'milestones', key: 'id' },
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('pending', 'completed'),
    },
    github_repo_link: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.dropTable('milestone_learner_teams'),
};

export default migration;
