import { v4 as uuid } from 'uuid';
import faker from 'faker';
import _ from 'lodash';

const VIDEO_MEETING = () => ({
  id: uuid(),
  video_id: faker.internet.domainName(),
  start_url: faker.internet.domainName(),
  join_url: faker.internet.domainName(),
  start_time: String(faker.date.future()), // zoom time format
  duration: '1 Hour',
  zoom_user: faker.name.firstName(),
  created_at: new Date(),
  updated_at: new Date(),
});

module.exports = {
  up: (queryInterface) => queryInterface.bulkInsert(
    'video_meetings', _.times(100, VIDEO_MEETING),
    {},
  ),

  down: queryInterface => queryInterface.bulkDelete('video_meetings', null, {}),
};
