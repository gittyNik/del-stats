import 'dotenv/config';
import mongoose from 'mongoose';
import logger from './logger';

const {
  NODE_ENV, MONGO_HOST, MONGO_DB: dbName, MONGO_USER: user, MONGO_PWD: pass,
} = process.env;

mongoose.set('debug', NODE_ENV === 'development');
mongoose.Promise = Promise;
logger.info(dbName);
export default () => mongoose.connect(MONGO_HOST, { user, pass });
