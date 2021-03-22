import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import db from '../database';
import { getChallengeByChallengeId, Challenge } from './challenge';
import { getCohortFromId } from './cohort';
import { getGithubConnecionByUserId } from './social_connection';
import {
  createRepositoryifnotPresentFromTemplate,
  provideAccessToRepoIfNot,
  getUserCommitsForRepo,
} from '../integrations/github/controllers';

import { User } from './user';

export const LearnerChallenge = db.define('learner_challenges', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  challenge_id: {
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
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  job_application_id: {
    type: Sequelize.UUID,
    references: { model: 'job_applications', key: 'id' },
  },
});

const { gt, between } = Sequelize.Op;

export const getRepoDetails = async (repo) => LearnerChallenge.findOne({
  include: [
    {
      model: User,
      attributes: ['name', 'id'],
    },
    Challenge,
  ],
  where: {
    repo,
  },
  raw: true,
});

export const latestChallengeInCohort = async (cohort_id) => {
  let ch = await getCohortFromId(cohort_id);
  return LearnerChallenge.findOne({
    include: [
      {
        model: User,
        attributes: ['name', 'id'],
      },
    ],
    order: [[Sequelize.col('created_at'), Sequelize.literal('DESC')]],
    where: {
      learner_id: { [Sequelize.Op.in]: ch.learners },
    },
    raw: true,
  });
};

export const getLearnerChallengesAfterDate = (
  after_date, learner_id,
) => LearnerChallenge.findOne({
  order: [[Sequelize.col('created_at'), Sequelize.literal('DESC')]],
  where: {
    created_at: { [gt]: after_date },
    learner_id,
  },
  raw: true,
});

export const getLearnerChallengesBetweenDate = (
  learner_id, before_date, after_date,
) => LearnerChallenge.findOne({
  order: [[Sequelize.col('created_at'), Sequelize.literal('DESC')]],
  where: {
    created_at: { [between]: [before_date, after_date] },
    learner_id,
  },
  raw: true,
});

export const updateLearnerChallenge = (id, job_application_id) => LearnerChallenge.update({
  job_application_id,
}, {
  where: { id },
  returning: true,
  raw: true,
})
  .then(result => result[1][0]);

export const learnerChallengesFindOrCreate = async (
  challenge_id,
  learner_id,
  privateRepo = true,
  job_application_id,
) => {
  try {
    let challenge;
    if (job_application_id) {
      challenge = await LearnerChallenge.findOne({
        where: {
          challenge_id,
          learner_id,
          job_application_id,
        },
        raw: true,
      });
    } else {
      challenge = await LearnerChallenge.findOne({
        where: {
          challenge_id,
          learner_id,
        },
        raw: true,
      });
    }
    let socialConnection = await getGithubConnecionByUserId(learner_id);
    let chllenge = await getChallengeByChallengeId(challenge_id);
    let repo_name;
    if (job_application_id) {
      repo_name = `${socialConnection.username}_${job_application_id}_${chllenge.starter_repo}`;
    } else {
      repo_name = `${socialConnection.username}_${chllenge.starter_repo}`;
    }
    console.log(challenge);
    if (challenge === null) {
      // No challenge for this learner yet
      // Create repository for Challenge
      await createRepositoryifnotPresentFromTemplate(
        chllenge.starter_repo,
        repo_name,
        privateRepo,
      );

      // Provide Access to learner
      await provideAccessToRepoIfNot(socialConnection.username, repo_name);

      // Add in learner_challenge table
      let chl = await LearnerChallenge.create({
        id: uuid(),
        challenge_id,
        learner_id,
        repo: repo_name,
        job_application_id,
      });
      return {
        challenge: chl,
        repo_link: `https://github.com/${process.env.SOAL_LEARNER_ORG}/${repo_name}`,
      };
    }
    try {
      await getUserCommitsForRepo(repo_name);
      console.log(`Fetched commits for Repo: ${repo_name}`);
    } catch (err) {
      console.warn(`Error while fetching commits: ${err}`);
    }

    // // Create repository for Challenge
    // await createRepositoryifnotPresentFromTemplate(
    //   chllenge.starter_repo,
    //   repo_name
    // );

    // // Provide Access to learner
    // await provideAccessToRepoIfNot(socialConnection.username, repo_name);

    // return LearnerChallenge.update(
    //   {
    //     repo: repo_name
    //   },
    //   {
    //     where: {
    //       challenge_id,
    //       learner_id
    //     },
    //     returning: true
    //   }
    // ).then(result => ({ repo: repo_name }));

    return {
      challenge,
      repo_link: `https://github.com/${process.env.SOAL_LEARNER_ORG}/${challenge.repo}`,
    };
  } catch (err) {
    return err;
  }
};

export const getChallengesByUserId = (
  learner_id,
  start_time,
  end_time,
) => {
  let where = {
    learner_id,
    created_at: {
      [Sequelize.Op.ne]: null,
    },
  };
  if ((start_time !== null) && (end_time !== null)) {
    where.created_at = { [between]: [start_time, end_time] };
  }
  return LearnerChallenge.findAll(
    {
      where,
      include: [
        {
          model: Challenge,
          attributes: ['topic_id'],
        }],
    },
    { raw: true },
  );
};

export const deleteLearnerChallengesByLearnerId = (learner_id) => LearnerChallenge.destroy({
  where: {
    learner_id,
  },
});

export const getLearnerChallengeCountByChallengeId = challenge_id => LearnerChallenge.count({
  where: {
    challenge_id,
  },
});

export default LearnerChallenge;
