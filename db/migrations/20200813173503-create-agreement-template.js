const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('agreement_templates', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    document_identifier: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
    },
    program: {
      type: Sequelize.STRING,
    },
    cohort_duration: {
      type: Sequelize.STRING,
    },
    is_isa: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    is_job_guarantee: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    payment_type: {
      type: Sequelize.STRING,
    },
  }),
  down: queryInterface => queryInterface.dropTable('agreement_templates'),
};

export default migration;
