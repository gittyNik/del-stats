import db from '../../src/database';
import faker from 'faker';

import {
  getLearnerFaqById,
  createLearnerFaq,
  getAllLearnerFaqs, updateLearnerFaq, toggleHelpfulLearnerFaq,
  toggleUnhelpfulLearnerFaq, deletelearnerFaq

} from '../../src/models/learner_faq';

faker.locale = 'en';

describe('Learner Faqs', () => {
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

  describe('Basic crud', () => {

    test.only('create a faq,', async () => {
      const program_id = 'tep';
      const title = faker.lorem.sentence();
      const body = faker.lorem.sentence();
      const user_id = '46c721b0-3a0a-487a-bc69-bc39311b7f7c';
      const topic = 'isa'
      const res = await createLearnerFaq({
        program_id,
        title,
        body,
        user_id,
        topic
      }).then(data => data.get({ plain: true }));
      console.log(res);
      expect(res).toBeDefined();
      expect(res).toMatchObject({
        program_id,
        title,
        body,
        updated_by: expect.arrayContaining([user_id])
      });
    })

    test('get all learner faqs', async () => {
      const faqs = await getAllLearnerFaqs();
      console.log(faqs);
      expect(faqs).toBeDefined();
      expect(faqs.length).toBeDefined();
    })

    test('update a learnerFaq', async () => {
      const learner_faq_id = '7881c2ae-676f-4977-b253-fa82d46ddfb7';
      const user_id = '46c721b0-3a0a-487a-bc69-bc39311b7f7c';

      const updated_faq = await updateLearnerFaq({
        title: 'A new title 2',
        body: 'Some body',
        learner_faq_id,
        user_id,
      });
      console.log(updated_faq);
      console.log(updated_faq.updated_by);
      expect(updated_faq).toBeDefined();
      expect(updated_faq.updated_by).toContain(user_id);
      expect(updated_faq).toMatchObject({
        id: learner_faq_id,
        title: 'A new title 2',
        body: 'Some body',
        updated_by: expect.arrayContaining([user_id])
      })
    });
    test('should delete a learnerFaq', async () => {
      const learner_faq_id = '975ebffa-9e31-4578-b598-c4d21d6fcc5c';
      const res = await deletelearnerFaq(learner_faq_id);
      console.log(res);
      expect(res).toBeDefined();
    });
    test('toggle helpful count in LearnerFaq', async () => {
      const learner_faq_id = '975ebffa-9e31-4578-b598-c4d21d6fcc5c';
      const user_id = '46c721b0-3a0a-487a-bc69-bc39311b7f7c';
      const res = await toggleHelpfulLearnerFaq({ learner_faq_id, user_id });
      console.log(res);
      expect(res).toBeDefined();
    });

    test('toggle unhelpful count in LearnerFaq', async () => {
      const learner_faq_id = '975ebffa-9e31-4578-b598-c4d21d6fcc5c';
      const user_id = '46c721b0-3a0a-487a-bc69-bc39311b7f7c';
      const res = await toggleUnhelpfulLearnerFaq({ learner_faq_id, user_id });
      console.log(res);
      expect(res).toBeDefined();
    })
  })
});
