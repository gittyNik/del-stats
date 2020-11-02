import Sequelize from 'sequelize';
import uuid from 'uuid';
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
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  starter_repo: Sequelize.STRING,
  difficulty: Sequelize.ENUM(...CHALLENGE_DIFFICULTY),
  size: Sequelize.ENUM(...CHALLENGE_SIZE),
});

export const getChallengeByChallengeId = id => Challenge.findOne({
  where: {
    id,
  },
});

export const getChallengesByTopicId = topic_id => Challenge.findAll(
  {
    where: {
      topic_id,
    },
  },
  { raw: true },
);

export const createAChallenge = (topic_id, description,
  starter_repo, difficulty, size, title) => Challenge.create(
  {
    id: uuid(),
    topic_id,
    description,
    starter_repo,
    difficulty,
    size,
    title,
  },
);

export const updateAChallenge = (
  id,
  topic_id,
  description,
  starter_repo,
  difficulty,
  size,
  title,
) => Challenge.update({
  topic_id,
  description,
  starter_repo,
  difficulty,
  size,
  title,
}, { where: { id } });

export const deleteAChallenge = (id) => Challenge.destroy(
  { where: { id } },
);
