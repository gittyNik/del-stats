import { createLogger, format, transports } from 'winston';
import { Papertrail } from 'winston-papertrail';
import moment from 'moment';
import 'dotenv/config';

const {
  combine, timestamp, printf, label, prettyPrint,
  splat, ms, colorize, simple, json, align,
} = format;

// LogFormat
const prodLogFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, message, label, timestamp,
}) => `${timestamp} [${label}] ${level}: ${message}`);

const jsonFormat = printf(({
  // eslint-disable-next-line no-shadow
  level, message, label, timestamp,
}) => `${new Date(timestamp).toLocaleString()} ${level} [${label}] ${message}`);

const debugFormat = printf(({
  level, message, label, timestamp,
}) => {
  const now = () => moment().format('YYYY-MM-DD HH:mm:ss');
  return `${timestamp} [${level}]: ${message}`;
});

// Winston Transports
const consoleLogger = new transports.Console({
  level: 'debug',
  color: colorize(),
  // format: simple(), // json() or  align() or prettyPrint() or combine(),
  // prodLogFormat,
  // prettyPrint(),

  // format: winston.format.json(),
});

// const paperLogger = new Papertrail({
//   host: 'logs3.papertrailapp.com',
//   port: 25335,
//   // The program for your transport, defaults to default
//   // program: pjson.name,
//   // id: 1234,
//   // disableTls set to true to disable TLS on your transport.
//   // The log level to use for this transport, defaults to info
//   // level: 'info';

//   // colorize - Enable colors in logs, defaults to false
//   // colorize: true,
//   inlineMeta: true,
//   logFormat: (level, message) => {
//     if (level === 'error') {
//       return `${level}: ${message}`;
//     }
//     return `${level} ${message}`;
//   },
// });

// paperLogger.on('error', err => {
//   console.error('Error in Papertrail', err);
// });

// Log Formats

// 3. configure
const logger = createLogger({
  level: 'info',
  format: combine(
    // splat(),
    timestamp(),
    label({ label: 'delta-api' }),
    colorize(),
    // prettyPrint(),
    // simple(),
    // json(),
    // align(),
    // winston.format.colorize(),
    // winston.format.json(),
    prodLogFormat,
  ),
  transports: [consoleLogger],
  exitOnError: false,
});

// logger.stream = {
//   write(message, encoding) {
//     logger.info(message);
//   },
// };

// if (process.env === 'production') {
//   logger.remove(consoleLogger);
//   logger.add(paperLogger);
// } else {
//   logger.add(paperLogger);
// }

export default logger;
