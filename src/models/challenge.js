import Sequelize, { Op } from 'sequelize';
import uuid from 'uuid';
import db from '../database';
import { createRepositoryifnotPresent, addFileToRepo } from '../integrations/github/controllers/repository.controller';

export const CHALLENGE_DIFFICULTY = ['easy', 'medium', 'difficult'];
export const CHALLENGE_SIZE = ['tiny', 'small', 'large'];
export const PATH = ['frontend', 'backend', 'fullstack', 'ds-algo'];

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
  path: Sequelize.ENUM(...PATH),
  tags: {
    type: Sequelize.ARRAY(Sequelize.UUID),
  },
  // Duration in minutes ex: 60 mins.
  duration: Sequelize.INTEGER,
  company_id: {
    type: Sequelize.UUID,
    references: { model: 'company_profiles', key: 'id' },
  },
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

export const getChallengesByCompanyId = company_id => Challenge.findAll({
  where: {
    company_id,
  },
}, { raw: true });

export const getFilteredChallenges = ({
  path,
  tags,
  company_id,
  topic_id,
  difficulty,
  min_duration,
  max_duration,
}) => Challenge.findAll({
  where: {
    path,
    tags: {
      [Op.contains]: tags,
    },
    company_id,
    topic_id,
    difficulty,
    duration: {
      [Op.between]: [min_duration, max_duration],
    },
  },
}, { raw: true });

export const createAChallenge = async ({
  topic_id,
  description,
  difficulty,
  size,
  title,
  path,
  tags,
  duration,
  company_id,
  user_name,
}) => {
  let repo_name = title.replace(/\s/g, '');
  if (repo_name) {
    repo_name = `${repo_name.toLowerCase()}_${Math.floor(new Date().getTime() / 1000)}`;

    let starter_repo = repo_name;
    await createRepositoryifnotPresent(repo_name, true);

    await addFileToRepo(repo_name, `Added README.md by ${user_name}`,
      description, 'README.md');
    return Challenge.create(
      {
        id: uuid(),
        topic_id,
        description,
        starter_repo,
        difficulty,
        size,
        title,
        path,
        tags,
        duration,
        company_id,
      },
    );
  }
  return { error: 'Invalid name for repo' };
};

export const updateAChallenge = ({
  id,
  topic_id,
  description,
  starter_repo,
  difficulty,
  size,
  title,
  path,
  tags,
  company_id,
  duration,
}) => Challenge.update({
  topic_id,
  description,
  starter_repo,
  difficulty,
  size,
  title,
  path,
  tags,
  company_id,
  duration,
}, { where: { id } });

export const deleteAChallenge = (id) => Challenge.destroy(
  { where: { id } },
);
