import Sequelize from 'sequelize';
import db from '../database';
import { Challenge } from './challenge';


export const LearnerChallenge = db.define('learner_challenges', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  challege_id: {
    type: Sequelize.UUID,
    references: { model: 'challenges', key: 'id' },
  },
  learner_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  repo: Sequelize.STRING,
  learner_feedback: Sequelize.TEXT,
  review: Sequelize.TEXT,
  reviewed_by: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
});

export default LearnerChallenge;

LearnerChallenge.belongsTo(Challenge);
