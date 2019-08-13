import 'dotenv/config';
import db from '../database';
import { createSuperAdmin } from '../models/user';
import { getSoalToken } from './token';

console.log('Welcome admin!');

db.authenticate()
  .then(createSuperAdmin)
  .then(([user, isNew]) => {
    if (isNew) {
      console.log('Created a new superadmin');
    }
    console.log(`Token is : ${getSoalToken(user)}`);
  }).catch(err => console.error('Database failure: Try running db migrations', err));

