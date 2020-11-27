'use strict';

const PLATFORM = [
  'website',
  'delta',
];

module.exports = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.addColumn('learner_faqs', 'platform', {
      type: Sequelize.ENUM(...PLATFORM),
    }, { transaction }),
    qi.changeColumn('learner_faqs', 'topics', {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'topics' },
        },
      ),
      defaultValue: [],
    }, { transaction }),
  ])),

  down: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.removeColumn('learner_faqs', 'platform', { transaction }),
    qi.changeColumn('learner_faqs', 'topics', {
      type: Sequelize.ARRAY(
        {
          type: Sequelize.UUID,
          references: { model: 'topics' },
        },
      ),
      defaultValue: [],
      allowNull: false,
    }, { transaction }),
  ]))
};
