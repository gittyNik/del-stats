module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('progresses', {
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
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('progresses'),
};
