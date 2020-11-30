import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import {
  randomNum, generateUuids, cleanArray, generateArray, cleanJSON,
} from '../../src/util/seederUtils';

const MILESTONE = {
  id: uuid(),
  name: faker.lorem.word(),
  duration: randomNum(10),
  alias: faker.lorem.word(),
  prerequisite_milestones: generateUuids(5),
  problem_statement: faker.lorem.paragraph(),
  learning_competencies: _.times(5, faker.lorem.word),
  guidelines: faker.lorem.text(),
  starter_repo: faker.internet.domainName(),
  releases: cleanJSON({
    id: uuid(),
    createdAt: new Date(),
  }),
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
  difficulty: _.sample(CHALLENGE_DIFFICULTY),
  size: _.sample(CHALLENGE_SIZE),
};

const LOCATIONS = ['Delhi', 'Mumbai', 'Hyderabad', 'Online'];

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
  locations: generateArray(3, _.sample, LOCATIONS),
  recruiters: generateUuids(),
  updated_by: cleanArray([{ user: uuid() }]),
  status: _.sample([
    'active',
    'removed',
  ]),
  // level_of_candidates: [''],
  // roles: [''],
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

const HIRING_STATUS = [
  'available', 'currently-unavailable',
  'hired',
];

const JOB_TYPE = ['internship', 'fulltime', 'intern2hire'];
const EXPERIENCE_REQUIRED = ['2+ Years', '1+ Years', 'Fresher'];

const JOB_POSTING = {
  id: uuid(),
  title: `Product Engineer at ${COMPANY.name}`,
  company_id: COMPANY.id,
  description: faker.lorem.sentences(2),
  status: _.sample(STATUS),
  views: Math.floor(Math.random() * 1000),
  interested: Math.floor(Math.random() * 300),
  created_at: faker.date.between((Date(2020, randomNum(8), 1)), (Date(2012, 0, 1))),
  updated_at: new Date(),
  tags: generateUuids(),
  // posted_by: cleanArray([{
  //   name: faker.name.firstName(),
  //   email: faker.internet.email(),
  //   phone: faker.phone.phoneNumber('+91##########'),
  // }]),
  vacancies: randomNum(10),
  attached_assignment: CHALLENGE.id,
  start_range: randomNum(5),
  job_type: _.sample(JOB_TYPE),
  locations: generateArray(3, _.sample, LOCATIONS),
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
  showcase_projects: cleanArray([{ project: faker.internet.domainName() }]),
  fields_of_interest: cleanArray([{ project: faker.internet.domainName() }]),
  city_choices: cleanArray([{ project: faker.internet.domainWord() }]),
  educational_background: cleanArray([{ project: faker.lorem.sentence() }]),
  work_experience: cleanArray([{ project: faker.lorem.sentence() }]),
  experience_level: _.sample(EXPERIENCE_REQUIRED),
  relevant_experience_level: faker.lorem.sentence(),
  skill_experience_level: cleanArray([{ project: faker.lorem.sentence() }]),
  review: faker.lorem.text(),
  reviewed_by: USER.id,
  status: _.sample(STATUS),
  hiring_status: _.sample(HIRING_STATUS),
  tags: generateUuids(),
  profile_views: randomNum(50),
  created_at: new Date(),
  updated_at: new Date(),
  available_time_slots: cleanArray([{ time: new Date() }]),
  updated_by: cleanArray([{ user: uuid() }]),
  additional_links: cleanArray([{ link: faker.internet.domainName() }]),
};

// job_applications
const JOB_APPLICATION = {
  id: uuid(),
  job_posting_id: JOB_POSTING.id,
  portfolio_id: PORTFOLIO.id,
  review: faker.lorem.sentence(),
  status: _.sample(APPLICATION_STATUS),
  assignment_status: _.sample(ASSIGNMENT_STATUS),
  offer_status: _.sample(OFFER_STATUS),
  interview_status: _.sample(INTERIEW_STATUS),
  assignment_due_date: new Date(),
  assignment_sent_date: new Date(),
  interview_date: faker.date.future(),
  counsellor_notes: faker.lorem.sentence(),
  created_at: new Date(),
  updated_at: new Date(),
};

const LEARNER_CHALLENGE = () => ({
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
});

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async (t) => {
    const addMilestones = queryInterface.bulkInsert(
      'milestones',
      [MILESTONE], { transaction: t },
      { releases: { type: new Sequelize.JSON() } },
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
      { posted_by: { type: new Sequelize.JSON() } },
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
      'learner_challenges', _.times(100, LEARNER_CHALLENGE),
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
