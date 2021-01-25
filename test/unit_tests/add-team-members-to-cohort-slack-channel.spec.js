import db from '../../src/database';
import { getTeamSlackIDs } from '../../src/models/slack_channels';
import web from '../../src/integrations/slack/delta-app/client';
import logger from '../../util/logger';

describe('Should test unit block or integration code', () => {
  beforeAll(() => {
    return db
      .authenticate()
      .then(async () => {
        const res = await db.query('SELECT current_database()');
        logger.info(`DB connected: ${res[0][0].current_database}`);
      });
  });

  afterAll(async (done) => {
    await db.close();
    done();
  });

  test('get list of all members from soal-team channel', async () => {
    const channel_id = 'C01ELB0DB7W';
    const delta_id = 'UQK32AAKU';
    let info;
    let members;
    try {
      members = await web.conversations.members({
        channel: channel_id,
      })
        .then(d => d.members.filter(m => m !== delta_id));
    } catch (err) {
      logger.error(err);
    }
    logger.info(members);
    const users = await Promise.all(members.map(m => web.users.info({ user: m }).then(d => d.user)));
    logger.info(users);
    expect(members).toBeDefined();
    expect(users).toBeDefined();
  })

  test.only('get Team slackIds', async () => {
    const list = await getTeamSlackIDs();
    logger.info(list);
    expect(list).toBeDefined();
  })
});
