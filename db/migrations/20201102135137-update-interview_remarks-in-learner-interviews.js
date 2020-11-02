'use strict';

module.exports = {
  up: (qi, Sequelize) => qi.sequelize.transaction(transaction => Promise.all([
    qi.changeColumn('learner_interviews', 'interviewer_remarks', {
      type: 'JSON USING CAST("interviewer_remarks" as JSON)',
    }, { transaction })
  ])),

  down: (qi, Sequelize) =>  qi.sequelize.transaction(transaction =>
Promise.all([ qi.changeColumn('learner_interviews', 'interviewer_remarks', {
type: Sequelize.STRING, defaultValue: "" }, { transaction }), ])), };
