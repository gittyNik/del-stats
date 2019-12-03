export const EVENT_INVITATION_STATUS = ['invited', 'rsvp', 'attended'];

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('soal_event_attendees', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    event_id: {
      type: Sequelize.UUID,
      references: { model: 'soal_events', key: 'id' },
    },
    user_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    name: Sequelize.STRING,
    phone: Sequelize.STRING,
    email: Sequelize.STRING,
    city: Sequelize.STRING,
    organization: Sequelize.STRING,
    status: Sequelize.ENUM(...EVENT_INVITATION_STATUS),
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.dropTable('soal_event_attendees', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_soal_event_attendees_status";', { transaction }),
  ])),
};

export default migration;
