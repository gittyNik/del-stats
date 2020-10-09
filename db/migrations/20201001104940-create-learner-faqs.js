const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('learner_faqs', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    program_id: {
      type: Sequelize.STRING,
      references: { model: 'programs', key: 'id' },
    },
    topics: {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'topics' },
        },
      ),
      defaultValue: [],
      allowNull: false,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    body: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    helpful: {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'users' },
        },
      ),
      defaultValue: [],
    },
    unhelpful: {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'users' },
        },
      ),
      defaultValue: [],
    },
    comments: {
      type: Sequelize.ARRAY(Sequelize.JSON),
    },
    updated_by: {
      type: Sequelize.ARRAY({
        type: Sequelize.UUID,
        references: { model: 'users' },
      }),
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
  }),
  down: queryInterface => queryInterface.dropTable('learner_faqs'),
};

export default migration;
