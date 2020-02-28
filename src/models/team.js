import Sequelize from "sequelize";
import uuid from "uuid/v4";
import _ from "lodash";
import faker from "faker";
import db from "../database";
import { CohortMilestone, getDataForMilestoneName } from "./cohort_milestone";
import { getProfile } from "./user";
import {
  toSentenceCase,
  createGithubRepository,
  repositoryPresentOrNot,
  addCollaboratorToRepository
} from "../integrations/github/controllers";
import { getGithubConnecionByUserId } from "./social_connection";

export const Team = db.define("milestone_learner_teams", {
  id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.UUID
  },
  name: {
    allowNull: false,
    type: Sequelize.STRING
  },
  cohort_milestone_id: {
    type: Sequelize.UUID,
    references: { model: "cohort_milestones", key: "id" }
  },
  learners: Sequelize.ARRAY(Sequelize.UUID),
  github_repo_link: Sequelize.STRING,
  product_demo_link: Sequelize.STRING,
  review: Sequelize.TEXT,
  reviewed_by: {
    type: Sequelize.UUID,
    references: { model: "users", key: "id" }
  },
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal("now()")
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal("now()")
  }
});

export const splitTeams = users => {
  const teams = [];
  const shuffled = _.shuffle(users);

  while (shuffled.length > 4) {
    teams.push(shuffled.splice(-3));
  }

  if (shuffled.length > 0) teams.push(shuffled);

  return teams;
};

export const deleteMilestoneTeams = (cohort_milestone_id, keepTeams = []) =>
  Team.destroy({
    where: { cohort_milestone_id },
    id: {
      [Sequelize.Op.notIn]: keepTeams
    }
  });

export const splitFrontEndAndBackEnd = async cohort_milestone_id => async m => {
  await m.map(async ms => await getProfile(ms));
  if (m[0].profile.hasOwnProperty("stack")) {
    let frontendUsers = [];
    let backendUsers = [];
    m.map(ms => {
      if (ms.profile.stack === "frontend") {
        frontendUsers.push(ms.id);
      } else {
        backendUsers.push(ms.id);
      }
    });
    const frontendTeams = splitTeams(frontendUsers);
    const backendTeams = splitTeams(backendUsers);
    let teams = [];
    frontendTeams.map(t => teams.push(t));
    backendTeams.map(t => teams.push(t));
    let data = await getDataForMilestoneName(cohort_milestone_id);
    let baseMilestoneName = `MS_${toSentenceCase(
      data.milestone.name
    )}_${toSentenceCase(data.cohort.name)}_${toSentenceCase(
      data.cohort.program_id
    )}_${toSentenceCase(data.cohort.location)}_${new Date(
      data.cohort.start_date
    ).getFullYear()}`;
    await teams.map(async (team, key) => {
      let msName = `${baseMilestoneName}_${key}`;
      let isRepo = await repositoryPresentOrNot(msName);
      if (!isRepo) {
        let repo = await createGithubRepository(msName);
        await team.map(async (user, key) => {
          let u = await getGithubConnecionByUserId(user);
          u = u.username;
          let col = await addCollaboratorToRepository(u, repo);
          // return {id: user, username: u.username}
        });
      }
      return {team, repo: msName};
    });
    return teams;
  } else {
    m.map(ms => ms.id);
    let data = await getDataForMilestoneName(cohort_milestone_id);
    let baseMilestoneName = `MS_${toSentenceCase(
      data.milestone.name
    )}_${toSentenceCase(data.cohort.name)}_${toSentenceCase(
      data.cohort.program_id
    )}_${toSentenceCase(data.cohort.location)}_${new Date(
      data.cohort.start_date
    ).getFullYear()}`;
    let teams = splitTeams(m);
    await teams.map(async (team, key) => {
      let msName = `${baseMilestoneName}_${key}`;
      let isRepo = await repositoryPresentOrNot(msName);
      if (!isRepo) {
        let repo = await createGithubRepository(msName);
        await team.map(async (user, key) => {
          let u = await getGithubConnecionByUserId(user);
          u = u.username;
          let col = await addCollaboratorToRepository(u, repo);
          // return {id: user, username: u.username}
        });
      }
      return {team, repo: msName};
    });
    return teams;
  }
};

export const createMilestoneTeams = cohort_milestone_id =>
  CohortMilestone.findByPk(cohort_milestone_id)
    .then(m => m.getUsers())
    .then(splitFrontEndAndBackEnd(cohort_milestone_id))
    .then(teams =>
      Team.bulkCreate(
        teams.map(({team, repo}) => ({
          id: uuid(),
          name: faker.commerce.productName(),
          cohort_milestone_id,
          learners: team,
          github_repo_link: repo
        }))
      )
    );

export const getTeamsbyCohortMilestoneId = cohort_milestone_id =>
  Team.findAll({
    where: { cohort_milestone_id }
  }, { raw: true });
