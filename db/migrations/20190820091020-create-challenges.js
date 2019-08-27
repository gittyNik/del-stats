import { CHALLENGE_DIFFICULTY, CHALLENGE_SIZE } from '../common/enums';

const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('challenges', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    topic_id: {
      type: Sequelize.UUID,
      references: { model: 'topics', key: 'id' },
    },
    description: Sequelize.TEXT,
    starter_repo: Sequelize.STRING,
    difficulty: Sequelize.ENUM(...CHALLENGE_DIFFICULTY),
    size: Sequelize.ENUM(...CHALLENGE_SIZE),
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('challenges'),
};

export default migration;
