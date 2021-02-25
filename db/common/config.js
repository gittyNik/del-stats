require('dotenv').config();
require('@babel/register');

let db_logs = false;
if (process.env.DB_LOGGING === 'true') {
  db_logs = true;
}

const common = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: false,
    underscored: true,
    underscoredAll: true,
  },
  logging: db_logs,
};

const settings = {
  development: {
    username: process.env.DEV_DB_USERNAME || 'postgres',
    password: process.env.DEV_DB_PASSWORD || '',
    database: process.env.DEV_DB_NAME || 'delta_development',
    host: process.env.DEV_DB_HOST || '127.0.0.1',
    port: process.env.DEV_DB_PORT || 5432,
    ...common,
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || '',
    database: process.env.TEST_DB_NAME || 'delta_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    port: process.env.TEST_DB_PORT || 5432,
    logging: false,
    ...common,
  },
  production: {
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 5432,
    ...common,
  },
};

switch (process.env.NODE_ENV) {
  case 'test':
  case 'production':
    settings.default = settings[process.env.NODE_ENV];
    break;
  default:
    settings.default = settings.development;
}

module.exports = settings;
