require('dotenv').config;

const settings = {
  "development": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": "delta_development",
    "host": "127.0.0.1",
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
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": process.env.DATABASE_USERNAME,
    "password": process.env.DATABASE_PASSWORD,
    "database": "delta",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}

settings.default = settings.development;

module.exports = settings;
