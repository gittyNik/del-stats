import db from '../../src/database';
import logger from '../../src/util/logger';

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

  test.only('testing jest', () => {
    expect(1 + 1).toBeDefined();
  })
});
