const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('applications', 'is_job_guarantee', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }, { transaction }),
  ])),
  down: (iface) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('applications', 'is_job_guarantee', { transaction }),
  ])),
};

export default migration;
