import uuid from 'uuid/v4';
import faker from 'faker';
import { Date } from 'core-js';
import _ from 'lodash';
import { randomNum, generateUuids } from '../../src/util/seederUtils';

const STATUS = [
  'active',
  'closed',
  'removed',
  'filled',
  'partially-filled',
];

const JOB_TYPE = ['internship', 'fulltime', 'intern2hire'];
const EXPERIENCE_REQUIRED = ['2+ Years', '1+ Years', 'Fresher'];

const COMPANY = {
  id: uuid(),
  name: faker.company.companyName(),
  description: faker.lorem.sentences(2),
  logo: faker.image.business(),
  website: faker.internet.domainName(),
  worklife: faker.lorem.paragraph(),
  perks: faker.lorem.paragraph(),
  views: randomNum(300),
  created_at: new Date(),
  updated_at: new Date(),
  tags: generateUuids(),
  // locations: generateArray(3, _.sample(LOCATIONS)),
  recruiters: generateUuids(),
  updated_by: generateUuids(2),
  status: _.sample([
    'active',
    'removed',
  ]),
  level_of_candidates: [''],
  roles: [''],
};

const CHALLENGE_DIFFICULTY = ['easy', 'medium', 'difficult'];
const CHALLENGE_SIZE = ['tiny', 'small', 'large'];

const BREAKOUT_PATH = [
  'frontend',
  'backend',
  'common',
];

const MILESTONE = {
  id: uuid(),
  name: faker.company.companyName(),
  duration: randomNum(10),
  alias: faker.lorem.word(),
  prerequisite_milestones: generateUuids(5),
  problem_statement: faker.lorem.paragraph(),
  // learning_competencies: [''],
  guidelines: faker.lorem.text(),
  starter_repo: faker.internet.domainName(),
  // releases: {},
  created_at: new Date(),
  updated_by: null,
};

const TOPIC = {
  id: uuid(),
  title: faker.lorem.sentence(randomNum(6)),
  description: faker.lorem.text(),
  program: 'demo',
  milestone_id: MILESTONE.id,
  optional: false,
  visible: true,
  domain: _.sample(['generic', 'tech', 'mindset', 'dsa']),
  created_at: new Date(),
  updated_at: new Date(),
  path: _.sample(BREAKOUT_PATH),
};

const ATTACHED_ASSIGNMENT = {
  id: uuid(),
  topic_id: TOPIC.id,
  title: faker.lorem.sentence(randomNum(6)),
  description: faker.lorem.text(),
  starter_repo: faker.internet.domainName(),
  difficulty: _.sample(CHALLENGE_DIFFICULTY),
  size: _.sample(CHALLENGE_SIZE),
};

const jobPostings = {
  id: uuid(),
  name: 'Demo',
  title: `Product Engineer at ${COMPANY.name}`,
  company_id: COMPANY.id,
  description: faker.lorem.sentences(2),
  status: _.sample(STATUS),
  views: Math.floor(Math.random() * 1000),
  interested: Math.floor(Math.random() * 300),
  created_at: faker.date.between((Date(2020, randomNum(8), 1)), (Date(2012, 0, 1))),
  updated_at: Date.now(),
  tags: generateUuids(),
  posted_by: generateUuids(),
  vacancies: randomNum(10),
  attached_assignment: ATTACHED_ASSIGNMENT.id,
  start_range: randomNum(5),
  job_type: _.sample(JOB_TYPE),
  // locations: generateArray(3, _.sample(LOCATIONS)),
  experience_required: _.sample(EXPERIENCE_REQUIRED),
};
jobPostings.end_range = jobPostings.start_range + randomNum(10);

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => {
    const addCompany = queryInterface.bulkInsert(
      'company_profiles', [COMPANY],
      { transaction: t },
    );

    const addMilestones = queryInterface.bulkInsert(
      'milestones',
      [MILESTONE], { transaction: t },
      { releases: { type: Sequelize.JSON() } },
    );

    const addTopics = queryInterface.bulkInsert(
      'topics',
      [TOPIC], { transaction: t },
    );

    const addAssignment = queryInterface.bulkInsert(
      'assignments',
      [ATTACHED_ASSIGNMENT], { transaction: t },
    );

    const addJobPosting = queryInterface.bulkInsert(
      'job_postings',
      [jobPostings], { transaction: t },
      { posted_by: { type: Sequelize.JSON() } },
    );

    return Promise.all([addCompany, addMilestones, addTopics, addAssignment, addJobPosting])
      .then(() => console.log('Seeded milestone, program , topic and resoures.'))
      .catch(err => console.error(err));
  }),

  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('company_profiles', null, { transaction: t }),
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('assignments', null, { transaction: t }),
    queryInterface.bulkDelete('job_postings', null, { transaction: t }),
  ])
    .then(() => console.log('milestones, company_profiles, assignments, topics, job_postings, reverted.'))
    .catch(err => console.error(err))),
};

export default seeder;
