import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';

const CODE_SANDBOX = () => ({
  id: uuid(),
  sandbox_id: faker.internet.domainName(),
  host_id: faker.internet.domainName(), // codesandbox user id.
});

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'video_meetings', _.times(100, CODE_SANDBOX),
    { sandbox_setting: { type: new Sequelize.JSON() } },
  ),

  down: queryInterface => queryInterface.bulkDelete('code_sandboxes', null, {}),
};
