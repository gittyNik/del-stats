import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum } from '../../src/util/seederUtils';

module.exports = {
  up: (queryInterface) => queryInterface.sequelize.transaction(async (t) => {

    const users = await queryInterface.sequelize.query(
      `SELECT id from users;`
    );

    const milestone_learner_teams = await queryInterface.sequelize.query(
      `SELECT id from milestone_learner_teams;`
    );

    const cohort_milestones = await queryInterface.sequelize.query(
      `SELECT id from cohort_milestones;`
    );

    const LEARNER_GITHUB_MILESTONES = () => ({
      id: uuid(),
      user_id: (_.sample(users[0])).id,
      team_id: (_.sample(milestone_learner_teams[0])).id,
      cohort_milestone_id: (_.sample(cohort_milestones[0])).id,
      number_of_lines: randomNum(100000),
      commits: randomNum(2000),
      repository_commits: randomNum(200),
      last_committed_at: faker.date.past(),
    });

    return queryInterface.bulkInsert('learner_github_milestones',
      _.times(100, LEARNER_GITHUB_MILESTONES),
      { transaction: t })
      .then(() => console.log('seeded learner_github_milestones'))
      .catch(err => console.log(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('learner_github_milestones', null, { transaction: t }),
  ])
    .then(() => console.log('learner_github_milestones reverted'))
    .catch(err => console.error(err))),
};
