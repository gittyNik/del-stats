const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ping_templates', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    text: Sequelize.TEXT,
    details: Sequelize.TEXT,
    author_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    response_format: Sequelize.STRING,
    domain: Sequelize.STRING,
    tags: Sequelize.ARRAY(Sequelize.STRING),
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('ping_templates'),
};

export default migration;
