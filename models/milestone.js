import Sequelize from 'sequelize';
const db =require('../database');

const Milestone = db.define('milestones', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  name : {
    allowNull : false,
    type : Sequelize.STRING
  },
  topics : {
    allowNull : false,
    type : Sequelize.ARRAY(Sequelize.UUID)
  },
});

module.exports = Milestone;
