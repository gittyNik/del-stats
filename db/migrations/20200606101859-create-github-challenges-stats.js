
export function up(queryInterface, Sequelize) {
  return queryInterface.createTable('learner_github_challenges', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      default: Sequelize.UUIDV4,
    },
    learner_challenge_id: {
      type: Sequelize.UUID,
      references: { model: 'learner_challenges' },
    },
    number_of_lines: Sequelize.INTEGER,
    repository_commits: Sequelize.ARRAY(Sequelize.JSON),
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    last_committed_at: {
      type: Sequelize.DATE,
    },
  });
}
export function down(queryInterface) {
  return queryInterface.dropTable('learner_challenges_github_data');
}
