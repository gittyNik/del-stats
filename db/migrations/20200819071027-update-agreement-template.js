const migration = {
  up: (iface, Sequelize) => iface.sequelize.transaction(transaction => Promise.all([
    iface.addColumn('agreement_templates', 'payment_details', Sequelize.JSON, { transaction }),
    iface.addColumn('agreement_templates', 'updated_by', Sequelize.DATE, { transaction }),
  ])),
  down: (iface) => iface.sequelize.transaction(transaction => Promise.all([
    iface.removeColumn('agreement_templates', 'payment_details', { transaction }),
    iface.removeColumn('agreement_templates', 'updated_by', { transaction }),
  ])),
};

export default migration;
