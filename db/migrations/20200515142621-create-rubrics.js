
const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('rubrics', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    milestone_id: {
      type: Sequelize.UUID,
      references: { model: 'milestones', key: 'id' },
    },
    rubric_name: {
      type: Sequelize.STRING,
    },
    program: {
      type: Sequelize.STRING,
      references: { model: 'programs', key: 'id' },
    },
    rubric_parameters: {
      type: Sequelize.JSON,
    },
  }),
  down: queryInterface => queryInterface.dropTable('rubrics'),
};

export default migration;
