import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';
import { cleanJSON } from '../../src/util/seederUtils';

const CODE_SANDBOX = () => ({
  id: uuid(),
  sandbox_id: `https://codesandbox.io/s/${faker.lorem.word()}-${faker.lorem.word()}-${faker.lorem.word()}`,
  host_id: faker.lorem.word(),
  sandbox_setting: cleanJSON({
    engine: {
      node: '8.12.0',
    },
    theme: 'light',
  }),
});

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'code_sandboxes', _.times(100, CODE_SANDBOX),
    { sandbox_setting: { type: new Sequelize.JSON() } },
  ),

  down: queryInterface => queryInterface.bulkDelete('code_sandboxes', null, {}),
};
