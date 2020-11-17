import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';

export const PING_TYPE = ['immediate', 'trigger'];
export const PING_STATUS = ['draft', 'sent', 'delivered'];

const Educator = {
  id: uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  phone: faker.phone.phoneNumber(),
  role: 'educator',
  location: faker.address.streetAddress(true),
};

const PingTemplate = {
  id: uuid(),
  text: 'ping template text',
  details: `ping template details ${faker.lorem.paragraph()}`,
  author_id: Educator.id,
  response_format: 'text/JSON',
  domain: faker.internet.domainName(),
  tags: ['tag 1', 'tag 2', 'tag 3'],
};

const Ping = {
  id: uuid(),
  ping_template_id: PingTemplate.id,
  type: _.sample(PING_TYPE),
  trigger: { type: 'breakout', id: uuid() },
  educator_id: Educator.id,
  recipiens: [String(uuid())],
  status: _.sample(PING_STATUS),
  time_scheduled: faker.date.past(),
};

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.transaction((t) => {
    const addEducator = queryInterface.bulkInsert(
      'users', [Educator],
      { transaction: t },
      {
        profile: { type: new Sequelize.JSON() },
        status: { type: new Sequelize.ARRAY(Sequelize.JSON) },
        status_reason: { type: new Sequelize.ARRAY(Sequelize.JSON) },
      },
    );
    const addPingTemplate = queryInterface.bulkInsert(
      'ping_templates', [PingTemplate],
      { transaction: t },
    );
    const addPing = queryInterface.bulkInsert(
      'pings', [Ping],
      { transaction: t },
      {
        trigger: { type: new Sequelize.JSON() },
        recipiens: { type: new Sequelize.ARRAY(Sequelize.UUID) },
      },
    );

    return Promise.all([addEducator, addPingTemplate, addPing])
      .then(() => console.log('Seeded Educator, Ping Template'))
      .catch(err => console.error(err));
  }),

  down: queryInterface => queryInterface.sequelize.transaction(t => Promise.all([
    queryInterface.bulkDelete('users', null, { transaction: t }),
    queryInterface.bulkDelete('ping_templates', null, { transaction: t }),
    queryInterface.bulkDelete('pings', null, { transaction: t }),
  ])
    .then(() => console.log('educators and ping templates reverted'))
    .catch(err => console.error(err))),
};

export default seeder;
