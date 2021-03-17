import pino from 'pino';
// import Rollbar from 'rollbar';

// https://github.com/pinojs/pino/issues/673#issuecomment-506979971
const wrap = logger => {
  const { error, child } = logger;
  function errorRearranger(...args) {
    if (typeof args[0] === 'string' && args.length > 1) {
      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg instanceof Error) {
          const [err] = args.splice(i, 1);
          args.unshift(err);
        }
      }
    }
    return error.apply(this, args);
  }
  function childModifier(...args) {
    const c = child.apply(this, args);
    c.error = errorRearranger;
    c.child = childModifier;
    return c;
  }
  logger.error = errorRearranger;
  logger.child = childModifier;
  return logger;
};

const logger = wrap(pino({
  level: 'debug',
  prettyPrint: { colorize: true },
  translateTime: true,
  timestamp: process.env.NODE_ENV === 'production' ? true : pino.stdTimeFunctions.isoTime,
  useMetadata: true,
}));

// for the production consoles, rollbar
// const logger = () => process.env.NODE_ENV === 'production' ? wrap(pino({
//   level: 'debug',
//   prettyPrint: { colorize: true },
//   translateTime: true,
//   timestamp: process.env.NODE_ENV === 'production' ? true : pino.stdTimeFunctions.isoTime,
//   useMetadata: true,
// })) : new Rollbar({
//   accessToken: process.env.ROLLBAR_TOKEN || '605a1f8338ab408fb5f2befad327f24f',
//   captureUncaught: true,
//   captureUnhandledRejections: true
// });

export default logger;
