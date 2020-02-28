const migration = {

  up: (queryInterface, Sequelize) => queryInterface.createTable('code_sanboxes', {
    id: {
      type: Sequelize.UUID,
      primaryKey: true,
    },
    sandbox_id: Sequelize.STRING,
    host_id: Sequelize.STRING, // codesandbox user id.
    sandbox_setting: Sequelize.JSON,

  }),
  down: queryInterface => queryInterface.dropTable('code_sandboxes'),
};

export default migration;
