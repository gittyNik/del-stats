require('dotenv').config();
const settings = {
  "development": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": process.env.DATABASE_NAME,
    "host": process.env.DATABASE_HOST,
    "dialect": "postgres",
    "pool": {
      max: 5,
      acquire: 30000,
      idle: 10000,
    }
  },
  "test": {
    "username":  process.env.DATABASE_USERNAME,
    "password":  process.env.DATABASE_PASSWORD,
    "database": "delta_test",
    "host": process.env.DATABASE_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": "delta",
    "host": process.env.DATABASE_HOST,
    "dialect": "postgres"
  }
}

settings.default = settings.development;

module.exports = settings;
