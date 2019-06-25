import Sequelize from 'sequelize';
import db from '../database';

const Progress = db.define('progresses', {
    team_id : {
      type : Sequelize.UUID,
      references : { model : 'teams', key : 'id' }
    },
    milestone_id : {
      type : Sequelize.UUID,
      references : { model : 'milestones', key : 'id' }
    },
    status : {
      allowNull : false,
      type:Sequelize.ENUM('pending','completed'),
    },
    github_repo_link : {
      allowNull : false,
      type : Sequelize.STRING
    }
  });

export default Progress;
