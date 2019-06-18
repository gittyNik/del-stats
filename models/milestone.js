import Sequelize from 'sequelize';
import db from '../database';

export const Milestone = db.define('milestones', {
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
