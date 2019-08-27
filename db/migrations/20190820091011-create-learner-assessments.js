const migration = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('learner_assessments', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    cohort_assessment_id: {
      type: Sequelize.UUID,
      references: { model: 'cohort_assessments', key: 'id' },
    },
    learner_id: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    review: Sequelize.TEXT,
    reviewed_by: {
      type: Sequelize.UUID,
      references: { model: 'users', key: 'id' },
    },
    learner_feedback: Sequelize.TEXT,
    created_at: Sequelize.DATE,
    updated_at: Sequelize.DATE,
  }),
  down: queryInterface => queryInterface.dropTable('learner_assessments'),
};

export default migration;
