const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('shortlisted_portfolios', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    portfolio_id: {
      type: Sequelize.UUID,
      references: { model: 'portfolios', key: 'id' },
    },
    company_id: {
      type: Sequelize.UUID,
      references: { model: 'company_profiles', key: 'id' },
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_by: Sequelize.ARRAY(Sequelize.JSON),
  }),
  down: queryInterface => queryInterface.dropTable('shortlisted_portfolios'),
};

export default migration;
