export const FIREWALL_APPLICATION_STATUS = ['applied', 'review_pending', 'offered', 'rejected', 'joined', 'archieved'];

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('applications', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    cohort_applied: Sequelize.UUID,
    cohort_joining: Sequelize.UUID,
    status: Sequelize.ENUM(...FIREWALL_APPLICATION_STATUS),
    payment_details: Sequelize.JSON,
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: queryInterface => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.dropTable('applications', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_applications_status";', { transaction }),
  ])),
};

export default migration;
