import { createLogger, format, transports } from 'winston';
import 'dotenv/config';

export const logger = createLogger({
  transports: [
    new transports.Console(),
  ],
});

export default logger;
