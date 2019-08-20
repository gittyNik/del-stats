module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('topics', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
    },
    title: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
    },
    program: {
      type: Sequelize.STRING,
      defaultValue: 'tep',
    },
    milestone_id: {
      type: Sequelize.UUID,
      references: { model: 'milestones', key: 'id' },
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('topics'),
};
