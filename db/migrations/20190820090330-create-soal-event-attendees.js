import { EVENT_INVITATION_STATUS } from '../common/enums';

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
  down: queryInterface => queryInterface.dropTable('soal_event_attendees'),
};

export default migration;
