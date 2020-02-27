export const SANDBOX_TYPE = ['breakout', 'minims', 'interview', 'cohort', 'milestone', 'team'];
export const PARTICIPANT_TYPE = ['all_learners', 'frontend_learners', 'backend_learners', 'team_learners'];

const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('code_sanboxes', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    sandbox_id: Sequelize.STRING,
    host_id: Sequelize.STRING, // codesandbox user id.
    participants_id: Sequelize.ARRAY(Sequelize.STRING), // learner ids
    sandbox_type: Sequelize.ENUM(...SANDBOX_TYPE),
    participant_type: Sequelize.ENUM(...PARTICIPANT_TYPE),
    sandbox_setting: Sequelize.JSON,
    topic_id: {
      type: Sequelize.UUID,
      references: { model: 'topics', key: 'id' },
    },
    learner_breakout: {
      type: Sequelize.UUID,
      references: { model: 'learner_breakouts', key: 'id' },
    },
    learner_challeng: {
      type: Sequelize.UUID,
      references: { model: 'learner_challenges', key: 'id' },
    },

  }),
  down: queryInterface => queryInterface.dropTable('code_sandboxes'),
};

export default migration;
