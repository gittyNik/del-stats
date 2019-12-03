export const PING_TYPE = ['immediate', 'trigger'];
export const PING_STATUS = ['draft', 'sent', 'delivered'];

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('pings', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    ping_template_id: {
      type: Sequelize.UUID,
      references: { model: 'ping_templates', key: 'id' },
    },
    type: Sequelize.ENUM(...PING_TYPE),
    trigger: Sequelize.JSON, // {type: 'breakout', id: 'uuid'}
    educator_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    recipiens: Sequelize.ARRAY(Sequelize.UUID),
    status: Sequelize.ENUM(...PING_STATUS),
    time_scheduled: Sequelize.DATE,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.dropTable('pings', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pings_type";', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pings_status";', { transaction }),
  ])),
};

export default migration;
