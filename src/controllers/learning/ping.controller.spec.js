import app from '../../server';
import request from 'supertest';
import dbConnect from '../util/dbConnect';
import { getFakeToken } from '../../util/token';

let db;

beforeAll(async () => {
  db = await dbConnect();
});

afterAll(async () => {
  await db.connection.close();
});

describe('Ping Controller', () => {
  it('should add a ping', () => request(app)
    .post('/api/pings')
    .set('Authorization', `Bearer ${getFakeToken()}`)
    .expect(201));
});
