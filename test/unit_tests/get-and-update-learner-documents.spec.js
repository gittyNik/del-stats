import db from '../../src/database';
import {
  createUserEntry,
  empty_user_documents,
  createOrUpdateUserDocument,
  getDocumentsByUser,
  insertIndividualDocument
} from '../../src/models/documents';

describe('Should get and update user documents for a user', () => {
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

  test('get empty user_documents', () => {
    const user_document = {
      document_name: 'learner-aadhar-front',
      is_required: true,
      is_verified: false,
      document_path: '/path/to/file',
      details: {
        comment: '',
        updated_by: '',
        updated_at: '',
      },
    }
    const empty = empty_user_documents();
    const ud = empty.find(_ud => _ud.document_name === user_document.document_name);
    console.log(ud);
    ud.is_verified = true;
    ud.document_path = user_document.document_path;
    console.log(empty);

    expect(ud).toBeDefined();
  });

  describe('Create a user document', () => {
    test('should create a userDocument', async () => {
      const ud = await createOrUpdateUserDocument();
      console.log(ud);
      expect(ud).toBeDefined();
    });

    test('should update an existing mandatory doucment', async () => {
      const singleDocument = {
        document_name: 'learner-aadhar-front',
        document_path: 'path/to/aadhar-front.png',
      }
      const res = await createOrUpdateUserDocument(singleDocument);
      console.log(res);
      expect(res).toBeDefined();
    });

    test('should update an existing document from options front', async () => {
      const singleDocument = {
        document_name: 'learner-dl-front',
        document_path: 'path/to/learner-dl-front.png',
      }
      const res = await createOrUpdateUserDocument(singleDocument);
      console.log(res);
      expect(res).toBeDefined();
    })

  });

  describe('Create or get user document in DB', () => {
    test('get Documents By user ', async () => {
      const user_id = '7c0bb3e2-aecb-47ed-a86e-91ebb8717f94';
      const res = await getDocumentsByUser(user_id);
      console.log(res.user_document);
      console.log(typeof res.user_document);
      expect(res).toBeDefined();
    });

    test.only('inserIndividualDocument learner-mandatory', async () => {
      const user_id = '7c0bb3e2-aecb-47ed-a86e-91ebb8717f94';
      const document = {
        document_name: 'learner-dl-front',
        document_path: 'path/to/learner-dl.png',
      };
      const res = await insertIndividualDocument(user_id, document);
      console.log(res);
      expect(res).toBeDefined();
      expect(res.user_documents).toEqual([
        expect.objectContaining({ ...document }),
        expect.anything()
      ])
    })
  })
});
