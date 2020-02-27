module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('tags', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tag_name: Sequelize.STRING,
      topic_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'topics' },
      },
      add_time: {
        type: Sequelize.DATE, // after moderation
      },
      owner: {
        type: Sequelize.UUID,
        references: { model: 'users' },
      },
      moderator: {
        type: Sequelize.ARRAY({
          type: Sequelize.UUID,
          references: { model: 'users' },
        }),
      },
      description: Sequelize.TEXT,
      source: Sequelize.STRING, // slack/web
      details: Sequelize.JSON,
      parent_tags: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true
      },
      child_tags: {
        type: Sequelize.ARRAY(Sequelize.UUID),
        allowNull: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('tags');
  }
};