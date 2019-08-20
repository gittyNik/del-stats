import { getIntentionPing } from './ping';
import dbConnect from '../util/dbConnect';

let db;

beforeAll(async () => {
  db = await dbConnect();
});

afterAll(async () => {
  await db.connection.close();
});

it('should get an intention ping if exists, create if doesnt', async () => {
  const ping = await getIntentionPing();

  expect(ping.type).toEqual('Intention');
});
