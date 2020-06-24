const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('assessment_slots', {
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
    cohort_duration: {
      type: Sequelize.INTEGER,
    },
    program: {
      type: Sequelize.STRING,
      references: { model: 'programs', key: 'id' },
    },
    assessment_day: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    time_scheduled: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    reviewer: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
      allowNull: true,
    },
    week: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    assessment_duration: {
      type: Sequelize.INTEGER,
    },
    slot_order: {
      type: Sequelize.INTEGER,
    },
    phase: Sequelize.STRING,
    assessment_rubric: Sequelize.JSON,
  }),
  down: queryInterface => queryInterface.dropTable('assessment_slots'),
};

export default migration;
