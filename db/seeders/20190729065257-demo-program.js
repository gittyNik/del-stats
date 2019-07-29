const faker = require('faker');
const uuid = require('uuid/v4');

const demoProgram = {
  id: 'demo',
  name: 'Demo',
  location: faker.address.city(),
  duration: 2, //weeks
  test_template: {},
  milestone_review_rubric: {},
};

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.sequelize.transaction((t) => {

      const addPrograms = queryInterface.bulkInsert('programs', [demoProgram],
        { transaction: t }, {
          test_template: { type: new Sequelize.JSON() },
          milestone_review_rubric: { type: new Sequelize.JSON() }
        });
      // const addResources = queryInterface.bulkInsert('resources', [],
      //   { transaction: t });
      // const addMilestones =  queryInterface.bulkInsert('milestones', [],
      //   { transaction: t });

      return Promise.all([ addPrograms]);
      // return Promise.all([ addPrograms, addResources, addMilestones]);
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.bulkDelete('programs', null, {}),
        queryInterface.bulkDelete('resources', null, {}),
        queryInterface.bulkDelete('milestones', null, {}),
      ]);
    });
  }
};
