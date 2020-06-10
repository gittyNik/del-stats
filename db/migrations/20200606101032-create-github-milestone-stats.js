
export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('learner_github_milestones', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
    },
    user_id: {
      type: Sequelize.UUID,
      references: { model: 'users' },
    },
    team_id: {
      type: Sequelize.UUID,
      references: { model: 'milestone_learner_teams' },
    },
    git_username: Sequelize.STRING,
    repository_name: Sequelize.STRING,
    number_of_lines: Sequelize.INTEGER,
    repository_commits: Sequelize.ARRAY(Sequelize.JSON),
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  });
}
export function down(queryInterface) {
  return queryInterface.dropTable('learner_milestones_github_data');
}
