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
          type:DataTypes.TEXT,
        } ,
        program:{
          type:DataTypes.STRING,
        },
        milestone_number: {
          type:DataTypes.INTEGER
        }
      }, { sequelize })
    };
  }