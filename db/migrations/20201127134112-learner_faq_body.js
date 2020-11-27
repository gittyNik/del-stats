'use strict';

module.exports = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('learner_faqs', 'body', { transaction }),
    qi.addColumn('learner_faqs', 'body', {
      type: Sequelize.STRING(10000),
      allowNull: false,
    }, { transaction }),
  ])),

  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('learner_faqs', 'body', { transaction }),
    qi.addColumn('learner_faqs', 'body', {
      type: Sequelize.STRING,
      allowNull: false,
    }, { transaction }),
  ]))
};
