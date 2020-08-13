import db from '../../../../database'
import { postMessage } from './chat';

describe('Unit tests for slack posting messages', () => {
  beforeAll(() => {
    return db
      .authenticate()
      .then(async () => {
        const res = await db.query('SELECT current_database()');
        console.log(`DB connected: ${res[0][0].current_database}`);
      });
  });

  afterAll(async (done) => {
    await db.close();
    done();
  });

  describe('post a message on a channel', () => {
    const channel_id = 'G018GBH1NSG';
    const text = 'Hey <!channel>, Hello';
    test('chat.postMessage', async () => {
      const res = await postMessage({ channel: channel_id, text })
      console.log(res);
      expect(res).toBeDefined();

    })
  })
})
