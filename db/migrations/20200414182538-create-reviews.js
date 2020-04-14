export const REVIEW_STATUS = ['scheduled', 'in-progress', 'completed', 'review-shared'];

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('reviews', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    scheduled_at: {
      type: Sequelize.DATE,
    },
    milestone_team_id: {
      type: Sequelize.UUID,
      references: { model: 'teams', key: 'id' },
    },
    milestone_name: Sequelize.STRING,
    learner_feedbacks: {
      type: Sequelize.ARRAY(Sequelize.JSON),
      allowNull: true,
    },
    team_feedback: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    zoom_url: Sequelize.STRING,
    call_details: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    additional_details: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM(...REVIEW_STATUS),
      allowNull: false,
    },
  }),
  down: queryInterface => queryInterface.dropTable('reviews'),
};

export default migration;
