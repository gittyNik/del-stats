import { BREAKOUT_TYPE, EVENT_STATUS } from '../common/enums';

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('cohort_breakouts', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    type: Sequelize.ENUM(...BREAKOUT_TYPE),
    domain: Sequelize.STRING,
    topic_id: {
      type: Sequelize.UUID,
      references: { model: 'topics', key: 'id' },
    },
    cohort_id: {
      type: Sequelize.UUID,
      references: { model: 'cohorts', key: 'id' },
    },
    time_scheduled: Sequelize.DATE,
    duration: Sequelize.INTEGER,
    location: Sequelize.STRING,
    catalyst_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    status: Sequelize.ENUM(...EVENT_STATUS),
    catalyst_notes: Sequelize.TEXT,
    catalyst_feedback: Sequelize.TEXT,
    attendance_count: Sequelize.INTEGER,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.dropTable('cohort_breakouts', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cohort_breakouts_type";', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cohort_breakouts_status";', { transaction }),
  ])),
};

export default migration;
