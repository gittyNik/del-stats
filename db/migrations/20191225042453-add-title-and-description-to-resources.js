const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('resources', 'topic_id', {
      type: Sequelize.UUID,
      allowNull: true,
    }, { transaction }),
    qi.changeColumn('resources', 'owner', {
      type: Sequelize.UUID,
      references: { model: 'users' },
    }, { transaction }),
    qi.changeColumn('resources', 'moderator', {
      type: Sequelize.UUID,
      references: { model: 'users' },
    }, { transaction }),
    qi.changeColumn('resources', 'program', {
      type: Sequelize.STRING,
      references: { model: 'programs' },
    }, { transaction }),
    qi.addColumn('resources', 'title', Sequelize.TEXT, { transaction }),
    qi.addColumn('resources', 'description', Sequelize.TEXT, { transaction }),
    qi.addColumn('resources', 'source', Sequelize.STRING, { transaction }),
    qi.addColumn('resources', 'details', Sequelize.JSON, { transaction }),
  ])),
  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('resources', 'topic_id', {
      type: Sequelize.UUID,
      allowNull: false,
    }, { transaction }),
    qi.removeConstraint('resources', 'resources_owner_fkey', { transaction }),
    qi.removeConstraint('resources', 'resources_moderator_fkey', { transaction }),
    qi.removeConstraint('resources', 'resources_program_fkey', { transaction }),
    qi.removeColumn('resources', 'title', { transaction }),
    qi.removeColumn('resources', 'description', { transaction }),
    qi.removeColumn('resources', 'source', { transaction }),
    qi.removeColumn('resources', 'details', { transaction }),
  ])),
};

export default migration;
