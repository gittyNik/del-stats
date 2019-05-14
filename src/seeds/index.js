import seed from './seed';
import dbConnect from '../util/dbConnect';

dbConnect()
.then(async ({connection}) => {
  await connection.dropDatabase();
  await seed(connection);
  connection.close();
})
.catch(console.error);
