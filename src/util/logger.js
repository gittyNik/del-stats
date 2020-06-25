import pjson from '../../package.json';
import 'dotenv/config';
import { Papertrail } from 'winston-papertrail';
import winston from 'winston';

const {
  combine, timestamp, printf,
} = winston.format;

const consoleLogger = new winston.transports.Console({
  level: 'debug',
});

const prodLogFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const paperLogger = new winston.transports.Papertrail({
  host: 'logs3.papertrailapp.com',
  port: 25335,
  program: pjson.name,
  logFormat: (level, message) => {
    if (level === 'error') {
      return `${level}-${message}`;
    }
    return `${level} - ${message}`;
  },
});

// paperLogger.on('error', err => {
//   console.error('Error in Papertrail', err);
// });

// 3. configure
const logger = winston.createLogger({
  format: combine(
    timestamp(),
    prodLogFormat,
  ),
  transports: [consoleLogger],
  exitOnError: false,
});

if (process.env === 'production') {
  logger.remove(consoleLogger);
} else {
  logger.add(paperLogger);
}


function gimme() {
  throw Error('calendar creation failed');
}
try {
  logger.info({
    name: 'asdfa',
    key: 234,
  });
  gimme();
} catch (err) {
  logger.error(err);
}

export default logger;
