export const VIDEO_TYPE = ['breakout', 'review', 'cohort', 'milestone', 'team'];
export const PARTICIPANT_TYPE = ['all_learners', 'frontend_learners', 'backend_learners', 'team_learners'];

const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('video_meetings', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    video_id: Sequelize.STRING,
    host_id: Sequelize.STRING, // zoom user id.
    participants_id: Sequelize.ARRAY(Sequelize.STRING),
    start_url: Sequelize.STRING,
    join_url: Sequelize.STRING,
    start_time: Sequelize.STRING, // zoom time format
    duration: Sequelize.STRING,
    status: Sequelize.STRING,
    video_type: Sequelize.ENUM(...VIDEO_TYPE),
    participant_type: Sequelize.ENUM(...PARTICIPANT_TYPE),
    meeting_setting: Sequelize.JSON,
    topic_id: {
      type: Sequelize.UUID,
      references: { model: 'topics' },
    },

  }),
  down: queryInterface => queryInterface.dropTable('video_meetings'),
};

export default migration;
