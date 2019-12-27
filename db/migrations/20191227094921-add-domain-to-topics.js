const migration = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('topics', 'domain', Sequelize.ENUM('generic', 'tech', 'mindset', 'dsa')),
  down: queryInterface => queryInterface.sequelize.transaction(transaction => Promise.all([
    queryInterface.removeColumn('topics', 'domain', { transaction }),
    queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_topics_domain";', { transaction }),
  ])),
};

export default migration;
