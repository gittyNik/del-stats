module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('resources', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    topic_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: 'topics', key: 'id' },
    },
    url: {
      type: Sequelize.STRING,
      unique: true,
    },
    owner: {
      type: Sequelize.UUID,
    },
    moderator: {
      type: Sequelize.UUID,
      allowNull: true,
    },
    thumbnail: {
      type: Sequelize.BLOB,
      unique: true,
      allowNull: true,
    },
    type: {
      type: Sequelize.ENUM('article', 'repo', 'video', 'tweet'),
      allowNull: false,
      defaultValue: 'article',
    },
    program: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'demo',
    },
    add_time: {
      type: Sequelize.DATE,
    },
    level: {
      type: Sequelize.ENUM('beginner', 'advanced'),
      allowNull: false,
    },
    tags: {
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('resources'),
};
