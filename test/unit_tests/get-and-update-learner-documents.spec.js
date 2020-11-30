import db from '../../src/database';
import { createUserEntry, empty_user_documents, createOrUpdateUserDocument } from '../../src/models/documents';

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
    test.only('should create a userDocument', async () => {
      const ud = await createOrUpdateUserDocument();
      console.log(ud);
      expect(ud).toBeDefined();
    });

    test.only('should update an existing mandatory doucment', async () => {
      const singleDocument = {
        document_name: 'learner-aadhar-front',
        document_path: 'path/to/aadhar-front.png',
      }
      const res = await createOrUpdateUserDocument(singleDocument);
      console.log(res);
      expect(res).toBeDefined();
    });

    test.only('should update an existing document from options front', async () => {
      const singleDocument = {
        document_name: 'learner-dl-front',
        document_path: 'path/to/learner-dl-front.png',
      }
      const res = await createOrUpdateUserDocument(singleDocument);
      console.log(res);
      expect(res).toBeDefined();
    })

  });
});
