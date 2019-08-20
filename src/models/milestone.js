import Sequelize from 'sequelize';
import db from '../database';

const Milestone = db.define('milestones', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    allowNull: false,
    type: Sequelize.STRING,
  },
});

export default Milestone;
