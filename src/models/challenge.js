import Sequelize from 'sequelize';
import db from '../database';


export const CHALLENGE_DIFFICULTY = ['easy', 'medium', 'difficult'];
export const CHALLENGE_SIZE = ['tiny', 'small', 'large'];

export const Challenge = db.define('challenges', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
  topic_id: {
    type: Sequelize.UUID,
    references: { model: 'topics', key: 'id' },
  },
  description: Sequelize.TEXT,
  starter_repo: Sequelize.STRING,
  difficulty: Sequelize.ENUM(...CHALLENGE_DIFFICULTY),
  size: Sequelize.ENUM(...CHALLENGE_SIZE),

});
