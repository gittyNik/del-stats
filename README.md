# Delta API

### Installation
- `npm install` to install the dependencies
- Api server
  - `npm run server` to start api server
  - `npm run seed` will add some dummy data to the mongodb
  - `npm run lint` to check eslint errors in api server

### Testing API
- `npm test` to run all the tests present inside the _test_ directory

### Delta db setup
List of commands that handle database schema
- `npx sequelize-cli db:create`
- `npx sequelize-cli db:migrate`
- `npx sequelize-cli seed:generate`
- `npx sequelize-cli db:seed:all`
