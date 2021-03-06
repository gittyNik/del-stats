const status = [
  'active',
  'inactive',
];
const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('mock_interview_slots', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    created_at: {
      type: Sequelize.DATE,
    // defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    program: {
      type: Sequelize.STRING,
    },
    cohort_duration: {
      type: Sequelize.INTEGER,
    },
    mock_interview_duration: {
      type: Sequelize.INTEGER,
    },
    mock_interview_day: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    time_scheduled: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    week: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    slot_order: {
      type: Sequelize.INTEGER,
    },
    status: {
      type: Sequelize.ENUM(...status),
      defaultValue: 'active',
    },
  }),
  down: queryInterface => queryInterface.dropTable('mock_interview_slots'),
};

export default migration;
