import Sequelize from "sequelize";
import uuid from "uuid/v4";
import db from "../database";
import { getChallengeByChallengeId } from "./challenge";
import { getGithubConnecionByUserId } from "./social_connection";
import {
  createGithubRepositoryFromTemplate,
  addCollaboratorToRepository,
  repositoryPresentOrNot,
  isRepositoryCollaborator
} from "../integrations/github/controllers";
export const LearnerChallenge = db.define("learner_challenges", {
  id: {
    type: Sequelize.UUID,
    primaryKey: true
  },
  challenge_id: {
    type: Sequelize.UUID,
    references: { model: "challenges", key: "id" }
  },
  learner_id: {
    type: Sequelize.UUID,
    references: { model: "users", key: "id" }
  },
  repo: Sequelize.STRING,
  learner_feedback: Sequelize.TEXT,
  review: Sequelize.TEXT,
  reviewed_by: {
    type: Sequelize.UUID,
    references: { model: "users", key: "id" }
  }
});

export default LearnerChallenge;

export const learnerChallengesFindOrCreate = async (
  challenge_id,
  learner_id
) => {
  try {
    let challenge = await LearnerChallenge.findOne({
      where: {
        challenge_id,
        learner_id
      }
    });
    if (challenge === null) {
      //No challenge for this learner yet
      let socialConnection = await getGithubConnecionByUserId(learner_id);
      let chllenge = await getChallengeByChallengeId(challenge_id);
      const repo_name = `${socialConnection.username}_${chllenge.starter_repo}`;

      // Create repository for Challenge

      let isPresent = await repositoryPresentOrNot(repo_name);

      if (!isPresent) {
        let repo = await createGithubRepositoryFromTemplate(
          chllenge.starter_repo,
          repo_name
        );
      }

      // Provide Access to learner

      let isCollaborator = await isRepositoryCollaborator(
        socialConnection.username,
        repo_name
      );

      if (!isCollaborator) {
        let collab = await addCollaboratorToRepository(
          socialConnection.username,
          repo_name
        );
      }

      // Add in learner_challenge table

      return LearnerChallenge.create({
        id: uuid(),
        challenge_id,
        learner_id,
        repo: repo_name
      });
    } else {
      return challenge;
    }
  } catch (err) {
    return err;
  }
};
