const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('milestones', 'releases', Sequelize.JSON, { transaction }),
    qi.addColumn('milestones', 'updated_by', {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'users' },
        },
      ),
      allowNull: true,
    }, { transaction }),
  ])),
  down: (qi) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('milestones', 'releases', { transaction }),
    qi.removeColumn('milestones', 'updated_by', { transaction }),
  ])),
};


export default migration;
