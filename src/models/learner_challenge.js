import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { getChallengeByChallengeId, Challenge } from './challenge';
import { getCohortFromId } from './cohort';
import { getGithubConnecionByUserId } from './social_connection';
import {
  createGithubRepositoryFromTemplate,
  addCollaboratorToRepository,
  repositoryPresentOrNot,
  isRepositoryCollaborator,
  createRepositoryifnotPresentFromTemplate,
  provideAccessToRepoIfNot,
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
  created_at: Sequelize.DATE,
  updated_at: Sequelize.DATE,
});


const { gt } = Sequelize.Op;

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

export const learnerChallengesFindOrCreate = async (
  challenge_id,
  learner_id,
) => {
  try {
    let challenge = await LearnerChallenge.findOne({
      where: {
        challenge_id,
        learner_id,
      },
      raw: true,
    });

    if (challenge === null) {
      // No challenge for this learner yet

      let socialConnection = await getGithubConnecionByUserId(learner_id);
      let chllenge = await getChallengeByChallengeId(challenge_id);
      const repo_name = `${socialConnection.username}_${chllenge.starter_repo}`;
      // Create repository for Challenge
      await createRepositoryifnotPresentFromTemplate(
        chllenge.starter_repo,
        repo_name,
      );

      // Provide Access to learner
      await provideAccessToRepoIfNot(socialConnection.username, repo_name);

      // Add in learner_challenge table
      let chl = await LearnerChallenge.create({
        id: uuid(),
        challenge_id,
        learner_id,
        repo: repo_name,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      return {
        challenge: chl,
        repo_link: `https://github.com/${process.env.SOAL_LEARNER_ORG}/${repo_name}`,
      };
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

export const getChallengesByUserId = (learner_id) => LearnerChallenge.findAll(
  {
    where: {
      learner_id,
    },
    include: [
      {
        model: Challenge,
        attributes: ['topic_id'],
      }],
  },
  { raw: true },
);


export const deleteLearnerChallengesByLearnerId = (learner_id) => LearnerChallenge.destroy({
  where: {
    learner_id,
  },
});

export const getLearnerChallengeCountByChallengeId = challenge_id => LearnerChallenge.count({
  where :{
    challenge_id,
  }
})


export default LearnerChallenge;