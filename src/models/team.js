import Sequelize from 'sequelize';
import db from '../database';

const Team = db.define('teams', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID
    },
    name : {
      allowNull : false,
      type : Sequelize.STRING
    },
  });

export default Team;
