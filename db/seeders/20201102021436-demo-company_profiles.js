import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';

// CONSTANTS
const STATUS = [
  'active',
  'removed',
];

const tag_ids = [
  '27cf70e6-6a0f-4ceb-a784-50657d58baae',
  '4d1f4a5c-10a6-44db-83a5-bea0c253e2cc',
  '37d4628a-2592-4314-9dc2-96a76d022bc5',
  'd4d49fc5-3279-4323-933a-550a5d71f346',
  '906a4bb7-23b8-47be-8d87-5bdc9afd7eb0',
  '3cc68b65-9e72-4dc5-8fbc-a8bc8a029d55',
  'eace5333-f863-4a94-986d-f57b2b7a0787',
  '9ea7d88b-f902-4733-8f44-5702cba36ead',
  '62a85236-dcf7-4147-a0df-c96dd195ba90',
  '16583b29-03d1-4a5c-8602-b2fd872c51a6',
  '24c0e386-4260-4ab2-b5be-78f1af52f1e9',
  '93fdccb9-69a0-4176-b1cc-3280ca06689a',
  'c15863ce-a124-43ea-a652-e5c81b032d50',
  '3cba40b8-6d80-4061-be58-97f90cb05e26',
  'e66046dd-72ca-452a-a5cf-cdafb455dd0c',
  '4fda6134-fdc9-4758-999e-06d4ace074dc',
  '2865822b-badc-495a-8c53-995b1b702201'
];
// const recruiters = _.range(10).map(() => uuid())
const recruiters = [
  'f1836869-3343-4c2d-bb97-19174c295746',
  'e6a78e51-31a8-47ce-bcb5-9318591a57f1',
  '53e7e0fd-e823-493a-9d22-96c0c0e28b85',
  '0fb56cfb-d0d7-4846-8471-1e497296ce76',
  '373ca6f6-9b05-4f96-a67a-b89f37639431',
  'b2f02dfa-e4a4-4543-ae0c-6c5f8121fa9c',
  '4b9ff46b-a0f7-4a12-a31c-d843429098ef',
  'ce0dc038-6a34-4f44-acf1-30d7cc78ed4a',
  'effb0e6a-6753-4f69-ae3d-8b259b077d26',
  'de038d8b-ff08-40de-93b0-a5f15eb7a00c'
];

const company_ids = [
  'c1d0727f-bbd4-491a-82bc-cc36ae8b1df5',
  '3d467c47-5025-4a36-8afa-d479e1302d2d',
  '3d1ebdbc-ed33-4126-9a3a-14aa24c7d5ad',
  '3342d8b0-2c73-4c85-84f9-f29fb3037772',
  '8463bc47-9110-42a1-88b6-90ff98c85e8d',
  '0a25a2e0-be81-4b2e-85ed-43d745d06313',
  'ea6e109c-4dc9-4bd5-9bb0-0c43690fec71',
  '56a201f7-dc87-462c-a78f-1e45c7ab0b62',
  'c4d77471-e372-4bac-844d-c52b15563ca6',
  'b56b41ad-6ad7-478a-a997-e006ec6ba6f3',
];

const superadmins = [
  '2feeb1dc-9422-4efb-8c61-acf69d32772d',
  '57dc93e1-43fd-2001-8409-5978398bdec7',
  '43728a3e-a311-4a1f-8ebe-07edd338cfef',
  'a7e440bf-107a-438a-b1b7-d88b95dec74e',
  '36728442-0b24-4a52-9a87-0af04490345c',
  '4a1deb2e-eca4-400f-ba54-cad0d185860e',
];

const cities = [
  'Hyderabad',
  'Mumbai',
  'Bangalore',
  'Pune',
  'Delhi',
  'Gurgaon',
  'Chennai',
];

// helper functions
const getSomeElements = (array) => faker.random.arrayElements(array, faker.random.number({
  min: 1, max: array.length,
}));

const cleanArray = (arr) => {
  return '{"' + arr.map(e => cleanEntry(e)).join('", "') + '"}'
}

const cleanEntry = (obj) => {
  return JSON.stringify(obj).replace(/"/g, '\\"')
}



// Individual Rows
const createCompanyProfile = (id, recruiter_id) => ({
  id,

  description: faker.company.catchPhrase(),
  logo: 'http://placeimg.com/640/480/business',
  website: faker.internet.url(),
  worklife: faker.lorem.sentences(),
  perks: faker.lorem.sentences(),
  views: faker.random.number({ min: 1, max: 500 }),
  created_at: new Date(),
  tags: `{${getSomeElements(tag_ids).join(',')}}`,
  locations: `{${getSomeElements(cities).join(',')}}`,
  recruiters: `{ ${recruiter_id}}`,
  updated_by: cleanArray([{ user_id: faker.random.arrayElement(superadmins) }]),
});

const createRecruiters = (id) => ({
  id,
  name: faker.name.findName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber('+919#########'),
  role: 'recruiter',
});

// SEEDER
const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(transaction => {
    const addRecruiters = queryInterface.bulkInsert(
      'users', recruiters.map(createRecruiters),
      { transaction },
    );
    const addCompanyProfile = queryInterface.bulkInsert(
      'company_profiles',
      _.range(10).map((i) => createCompanyProfile(company_ids[i], recruiters[i])),
      { transaction },
    );
    return Promise.all([addRecruiters, addCompanyProfile])
      .then(() => console.log('Recruiter and company profiles are created'))
      .catch(err => {
        console.error(err);
        console.log('====================================');
        console.error(err.message);
      });
  }),

  down: (queryInterface, Sequelize) => queryInterface.sequelize.transaction(transaction => {
    return Promise.all([
      queryInterface.bulkDelete('company_profiles', null, { transaction }),
      queryInterface.bulkDelete(
        'users',
        {
          role: 'recruiter',
        }, { transaction },
      ),
    ])
      .then(() => console.log('Recruiter and company_profiles are removed.'))
      .catch(err => {
        console.error(err);
        console.log('====================================');
        console.error(err.message);
      });
  }),
};

export default seeder;
