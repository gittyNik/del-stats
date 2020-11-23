import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { randomNum, generateUuids } from '../../src/util/seederUtils';

const MILESTONE = {
  id: uuid(),
  name: faker.company.companyName(),
  // duration: randomNum(10),
  // alias: faker.lorem.word(),
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
  // path: _.sample(BREAKOUT_PATH),
};

const CHALLENGE_DIFFICULTY = ['easy', 'medium', 'difficult'];
const CHALLENGE_SIZE = ['tiny', 'small', 'large'];

const CHALLENGE = {
  id: uuid(),
  topic_id: TOPIC.id,
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  starter_repo: faker.internet.domainName(),
  difficulty: _.sample(...CHALLENGE_DIFFICULTY),
  size: _.sample(...CHALLENGE_SIZE),
};

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

const USER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('+91##########'),
  role: 'learner',
  location: faker.address.city(),
  // picture: faker.internet.avatar(), not migrated on table
};

const REVIEWER = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('+91##########'),
  role: 'educator',
  location: faker.address.city(),
  // picture: faker.internet.avatar(), not migrated on table
};

const STATUS = [
  'active',
  'closed',
  'removed',
  'filled',
  'partially-filled',
];

const JOB_TYPE = ['internship', 'fulltime', 'intern2hire'];
const EXPERIENCE_REQUIRED = ['2+ Years', '1+ Years', 'Fresher'];

const JOB_POSTING = {
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
  attached_assignment: CHALLENGE.id,
  start_range: randomNum(5),
  job_type: _.sample(JOB_TYPE),
  // locations: generateArray(3, _.sample(LOCATIONS)),
  experience_required: _.sample(EXPERIENCE_REQUIRED),
};
JOB_POSTING.end_range = JOB_POSTING.start_range + randomNum(10);

const APPLICATION_STATUS = [
  'active',
  'assignment',
  'interview',
  'shortlisted',
  'hired',
  'rejected',
  'closed',
];

const ASSIGNMENT_STATUS = [
  'sent',
  'accepted',
  'started',
  'completed',
  'reviewed',
];

const OFFER_STATUS = [
  'offered',
  'accepted',
  'candidate-rejected',
  'recruiter-rejected',
];

const INTERIEW_STATUS = [
  'scheduled',
  'live',
  'completed',
  'rescheduled',
  'cancelled',
];

const PORTFOLIO = {
  id: uuid(),
  learner_id: USER.id,
  showcase_projects: [{ project: faker.internet.domainName() }],
  fields_of_interest: [{ project: faker.internet.word() }],
  city_choices: [{ project: faker.internet.word() }],
  educational_background: [{ project: faker.internet.sentance() }],
  work_experience: [{ project: faker.internet.sentance() }],
  experience_level: _.sample(EXPERIENCE_REQUIRED),
  relevant_experience_level: faker.internet.sentance(),
  skill_experience_level: [{ project: faker.internet.sentance() }],
  review: faker.lorem.text(),
  reviewed_by: USER.id,
  status: _.sample(STATUS),
  hiring_status: _.sample(STATUS),
  tags: generateUuids(),
  profile_views: randomNum(50),
  created_at: new Date(),
  updated_at: new Date(),
  available_time_slots: [{ time: new Date() }],
  updated_by: [{ user: uuid() }],
  additional_links: [{ link: faker.internet.domainName() }],
};

// job_applications
const JOB_APPLICATION = {
  id: uuid(),
  job_posting_id: JOB_POSTING.id,
  portfolio_id: PORTFOLIO.id,
  review: faker.lorem.sentence(),
  status: _.sample(...APPLICATION_STATUS),
  assignment_status: _.sample(...ASSIGNMENT_STATUS),
  offer_status: _.sample(...OFFER_STATUS),
  interview_status: _.sample(...INTERIEW_STATUS),
  assignment_due_date: new Date(),
  assignment_sent_date: new Date(),
  interview_date: faker.date.future(),
  counsellor_notes: faker.lorem.sentence(),
  created_at: new Date(),
  updated_at: new Date(),
};

const LEARNER_CHALLENGE = {
  id: uuid(),
  challenge_id: CHALLENGE.id,
  learner_id: USER.id,
  repo: faker.internet.domainName(),
  learner_feedback: faker.lorem.text(),
  review: faker.lorem.text(),
  reviewed_by: REVIEWER.id,
  created_at: new Date(),
  updated_at: new Date(),
  job_application_id: JOB_APPLICATION.id,
};

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addMilestones = queryInterface.bulkInsert(
      'milestones',
      [MILESTONE], { transaction: t },
      { releases: { type: Sequelize.JSON() } },
    );

    const addTopics = queryInterface.bulkInsert(
      'topics',
      [TOPIC], { transaction: t },
    );

    const addChallenge = queryInterface.bulkInsert(
      'challenges',
      [CHALLENGE], { transaction: t },
    );

    const addCompany = queryInterface.bulkInsert(
      'company_profiles', [COMPANY],
      { transaction: t },
    );

    const addJobPosting = queryInterface.bulkInsert(
      'job_postings',
      [JOB_POSTING], { transaction: t },
      { posted_by: { type: Sequelize.JSON() } },
    );

    const addUser = queryInterface.bulkInsert(
      'users', [USER],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const addReviewer = queryInterface.bulkInsert(
      'users', [REVIEWER],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );

    const addPortfolios = queryInterface.bulkInsert(
      'portfolios', [PORTFOLIO],
      { transaction: t },
      {
        resume: { type: new Sequelize.JSON() },
        capstone_project: { type: new Sequelize.JSON() },
      },
    );

    const addJobApplication = queryInterface.bulkInsert(
      'job_applications', [JOB_APPLICATION],
      { transaction: t },
      {
        offer_details: { type: new Sequelize.JSON() },
        applicant_feedback: { type: new Sequelize.JSON() },
      },
    );

    const addLearnerChallenge = queryInterface.bulkInsert(
      'learner_challenges', [LEARNER_CHALLENGE],
      { transaction: t }, {},
    );

    return Promise.all([addMilestones, addTopics, addChallenge, addCompany,
      addReviewer, addUser, addJobPosting, addPortfolios, addJobApplication, addLearnerChallenge])
      .then(() => console.log('Seeded Learner Challenges'))
      .catch(err => console.error(err));
  }),

  down: async queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('milestones', null, { transaction: t }),
    queryInterface.bulkDelete('topics', null, { transaction: t }),
    queryInterface.bulkDelete('challenges', null, { transaction: t }),
    queryInterface.bulkDelete('company_profiles', null, { transaction: t }),
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('job_postings', null, { transaction: t }),
    queryInterface.bulkDelete('portfolios', null, { transaction: t }),
    queryInterface.bulkDelete('job_applications', null, { transaction: t }),
    queryInterface.bulkDelete('learner_challenges', null, { transaction: t }),
  ])
    .then(() => console.log('learner challenges with seeds reverted'))
    .catch(err => console.error(err))),
};

export default seeder;
