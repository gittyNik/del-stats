export const BREAKOUT_TYPES = ['codealong', 'activity', 'groupdiscussion'];
export const EVENT_STATUS = ['scheduled', 'started', 'cancelled', 'aborted', 'running'];

const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('team_breakout', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    team_id: Sequelize.UUID,
    details: Sequelize.JSON, // meeting ID, and Codesandbox ID.
    type: Sequelize.ENUM(...BREAKOUT_TYPES),
    time_scheduled: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    status: Sequelize.ENUM(...EVENT_STATUS),
    duration: {
      type: Sequelize.INTEGER,
      defaultValue: 18000000,
    },
    notes: Sequelize.TEXT,
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('team_breakout'),
};

export default migration;
