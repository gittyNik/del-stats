const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('resources', 'thumbnail', {
      type: Sequelize.STRING,
      allowNull: true,
    }, { transaction })
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('resources', 'thumbnail', {
      type: Sequelize.BLOB,
      unique: true,
    }, { transaction })
  ])),
};

export default migration;