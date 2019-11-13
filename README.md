# Delta API

### Initialization
- Database requirements
  - Install and run `PostgreSQL` server
  - Configure a postgres database in `db/config/config.js`
- Database setup for Delta
  - `npm run db:init` to create db
  - `npm run db:migrate` to update db schema
  - `npm run db:seed` to add some dummy data to db

### Installation
- `npm install` to install the dependencies
- `npm start` to start **delta-api server

### Additional commands
  - `npm test` to run all the tests
  - `npm run lint` to check eslint errors
  - `npm run admin` to display an authentication token

### Documentation

API documentation is available at path `/api/doc` of the api-server in `development` environment. Update the host in package.json's `apidoc.sampleUrl`.


