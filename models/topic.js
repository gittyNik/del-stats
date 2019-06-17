import Sequelize from 'sequelize';
module.exports =
  class Topic extends Sequelize.Model {
    static init(sequelize) {
      return super.init({
        id:{
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID
        },
        title:{
          type:Sequelize.STRING,
        },
        description:{
          type:Sequelize.TEXT,
        } ,
        program:{
          type:Sequelize.STRING,
        },
        milestone_number: {
          type:Sequelize.INTEGER
        }
      }, { sequelize })
    };
  }