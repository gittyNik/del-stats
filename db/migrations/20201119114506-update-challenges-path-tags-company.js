const PATH = [
  'frontend',
  'backend',
  'fullstack',
  'ds-algo',
];

const migration = {
  up: (qi, Sequelize) => qi.sequelize.transaction(t => Promise.all([
    qi.addColumn('challenges', 'path', {
      type: Sequelize.ENUM(...PATH),
    }, { transaction: t }),
    qi.addColumn('challenges', 'tags', {
      type: Sequelize.ARRAY(Sequelize.UUID),
    }, { transaction: t }),
    qi.addColumn('challenges', 'duration', Sequelize.INTEGER, { transaction: t }),
    qi.addColumn('challenges', 'company_id', {
      type: Sequelize.UUID,
      references: { model: 'company_profiles', key: 'id' },
    }, { transaction: t }),
  ])),

  down: (qi, Sequelize) => qi.sequelize.transaction(t => Promise.all([
    qi.removeColumn('challenges', 'path', { transaction: t }),
    qi.sequelize.query('DROP TYPE IF EXISTS "enum_challenges_path";', { transaction: t }),
    qi.removeColumn('challenges', 'tags', { transaction: t }),
    qi.removeColumn('challenges', 'duration', { transaction: t }),
    qi.removeColumn('challenges', 'company_id', { transaction: t }),
  ])),
};

export default migration;
