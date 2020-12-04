import 'dotenv/config';
import db from '../database';
import { createSuperAdmin } from '../models/user';
import { getSoalToken } from './token';
import logger from './logger';

logger.info('Welcome admin!');

db.authenticate()
  .then(createSuperAdmin)
  .then(([user, isNew]) => {
    if (isNew) {
      logger.info('Created a new superadmin');
    }
    logger.info(`Token is : ${getSoalToken(user)}`);
  }).catch(err => logger.error('Database failure: Try running db migrations', err));
