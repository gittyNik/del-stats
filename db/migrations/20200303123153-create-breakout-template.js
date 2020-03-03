const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('breakout_templates', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true
    },
    topic_id: {
        type: Sequelize.ARRAY(
            {
                type: Sequelize.UUID,
                references: { model: 'topics' },
            }
        ),
        allowNull: false,
    },
    mandatory: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    level: Sequelize.ENUM(...BREAKOUT_LEVEL),
    primary_catalyst: {
        type: Sequelize.UUID,
        references: { model: 'users' },
        allowNull: false
    },
    secondary_catalysts: {
        type: Sequelize.ARRAY(
        {
            type: Sequelize.UUID,
            references: { model: 'users' },
            allowNull: true
        })
    },
    // Will have sandbox url,
    // {'sandbox': {'template': {}}, 'zoom': {}}
    details: Sequelize.JSON,
    duration: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
    },
    time_scheduled: {
      type: Sequelize.TIME,
      allowNull: false,
    },
    after_days: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_by: {
        type: Sequelize.ARRAY(
            {
                type: Sequelize.UUID,
                references: { model: 'users' },
            }
        ),
        allowNull: true,
     },
  }),
  down: queryInterface => queryInterface.dropTable('breakout_templates'),
};

export default migration;
