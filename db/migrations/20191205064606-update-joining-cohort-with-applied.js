const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.bulkUpdate('applications', {
      cohort_joining: Sequelize.literal('cohort_applied'),
    }, { cohort_joining: null }, { transaction }),
    iface.changeColumn('applications', 'cohort_joining', {
      type: Sequelize.UUID,
      allowNull: false,
    }, { transaction }),
  ])),
  down: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.changeColumn('applications', 'cohort_joining', {
      type: Sequelize.UUID,
      allowNull: true,
    }, { transaction }),
  ])),
};

export default migration;
