module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('applications', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull:false,
      },
      cohort_applied: Sequelize.UUID, 
      cohort_joining: Sequelize.UUID,
      status: Sequelize.ENUM('applied', 'review_pending', 'offered', 'rejected', 'joined'), 
      payment_details: Sequelize.JSON,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('applications');
  }
};