import Sequelize from 'sequelize';
import db from '../database';

export const SlackChannel = db.define('slack_channel', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  cohort_id: {
    type: Sequelize.UUID,
    references: { model: 'cohorts' },
  },
  channels: Sequelize.ARRAY({
    type: Sequelize.STRING,
    allowNUll: false,
  }),
});

export default SlackChannel;

// export const addChannelsToCohort = () => {

// }
