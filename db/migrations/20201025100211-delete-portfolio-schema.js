const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('portfolios', 'resume', { transaction }),
    qi.removeColumn('portfolios', 'hiring_status', { transaction }),
    qi.addColumn('portfolios', 'profile_views', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    }, { transaction }),
    qi.addColumn('portfolios', 'updated_by', Sequelize.ARRAY(Sequelize.JSON), { transaction }),
    qi.addColumn('portfolios', 'skill_experience_level', Sequelize.ARRAY(Sequelize.JSON), { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('portfolios', 'resume', Sequelize.BLOB, { transaction }),
    qi.addColumn('portfolios', 'hiring_status', Sequelize.STRING, { transaction }),
    qi.removeColumn('portfolios', 'profile_views', { transaction }),
    qi.removeColumn('portfolios', 'updated_by', { transaction }),
    qi.removeColumn('portfolios', 'skill_experience_level', { transaction }),
  ])),
};

export default migration;
