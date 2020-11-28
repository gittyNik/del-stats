'use strict';

module.exports = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('learner_faqs', 'section', {
      type: Sequelize.STRING,
    }, { transaction }),
  ])),

  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('learner_faqs', 'section', { transaction }),
  ]))
};
