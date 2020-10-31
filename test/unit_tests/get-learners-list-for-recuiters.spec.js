import db from '../../src/database';
import '../../src/models';
import { getLearnerList } from '../../src/models/portfolio';


describe('should return a list of learners registered for placement drive', () => {
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

  describe('get list of learners', () => {
    test('should return getLearnerList', async () => {
      const res = await getLearnerList();
      console.log(res);
      expect(res).toBeDefined();
    });
  });
});
