import dotenv from 'dotenv/config';
import app from './server';
import db from './database';
import {createSuperAdmin} from './models/user';

const {PORT} = process.env;

db.authenticate()
.then(createSuperAdmin)
.then(user => {
  app.listen(PORT, err => {
    if (!err) {
      console.log(`Server is running on port: ${PORT}`);
    }
  });
}).catch(err => console.error('Database failure: Try running db migrations', err));
