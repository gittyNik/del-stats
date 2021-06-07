import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'dotenv/config';
import app from './server';
import db from './database';
import './cron_jobs';
import logger from './util/logger';
// import { userAndTeamCommitsDayWise } from './integrations/github/controllers';

const { PORT } = process.env;

db.authenticate()
  .then(() => {
    app.listen(PORT, err => {
      if (!err) {
        logger.info(`Server is running on port: ${PORT}`);
      }
    });
  })
  .catch(err => logger.error('Database failure: Try running db migrations', err));

// catch all unhandled promise rejections
process.on('unhandledRejection', error => {
  logger.error('didn\'t catch Unhandled promise rejection', error);
});
