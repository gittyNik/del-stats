import { v4 as uuid } from 'uuid';

const seeder = {
  up: queryInterface => queryInterface.bulkInsert('users', [{
    id: uuid(),
    name: 'John Doe',
    email: 'john@doe.com',
    phone: '9876543210',
  }], {}),

  down: queryInterface => queryInterface.bulkDelete('users', null, {}),
};

export default seeder;
