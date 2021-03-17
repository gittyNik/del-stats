import { v4 as uuid } from 'uuid';
import faker from 'faker';
import _ from 'lodash';
import { randomNum, cleanArray } from '../../src/util/seederUtils';

module.exports = {
  up: (queryInterface) => queryInterface.sequelize.transaction(async (t) => {
    const learner_challenges = await queryInterface.sequelize.query(
      'SELECT id from learner_challenges;',
    );

    const cohort_milestones = await queryInterface.sequelize.query(
      'SELECT id from cohort_milestones;',
    );

    const LEARNER_GITHUB_CHALLENGE = () => ({
      id: uuid(),
      learner_challenge_id: _.sample((learner_challenges[0]).id),
      cohort_milestone_id: _.sample((cohort_milestones[0]).id),
      number_of_lines: randomNum(100),
      commits: randomNum(100),
      repository_commits: cleanArray([{ id: uuid(), url: faker.internet.domainName() }]),
      last_committed_at: new Date(),
      updated_at: new Date(),
    });

    return queryInterface.bulkInsert('learner_github_challenges',
      _.times(100, LEARNER_GITHUB_CHALLENGE),
      { transaction: t },
      {})
      .then(() => console.log('seeded learner_github_challenges'))
      .catch(err => console.log(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('learner_github_challenges', null, { transaction: t }),
  ])
    .then(() => console.log('learner_github_challenges reverted'))
    .catch(err => console.error(err))),
};
