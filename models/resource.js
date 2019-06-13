import Sequelize from 'sequelize';
const db =require('../database');

const Resource = db.define('resources', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  topic_id: {
    type: Sequelize.UUID,
    allowNull:true,
    //references:{ model: 'topics', key: 'id' }
  },
  url: {
    type: Sequelize.STRING,
    unique: true
  },
  owner: {
    type: Sequelize.UUID,
    unique: true
  },
  moderator:{
    type: Sequelize.UUID,
    allowNull:false,
  }, 
  thumbnail:{
    type:Sequelize.BLOB,
    unique:true,
  }, 
  type: {
    type:Sequelize.ENUM('article', 'repo', 'video', 'tweet'),
    allowNull:false,
  },
  program: {
    type:Sequelize.STRING,
    allowNull:false,
  },
  add_time: {
    type:Sequelize.DATE,
  },
  tags: {
    type:Sequelize.ARRAY(Sequelize.STRING),
  },
});
module.exports = Resource;

/*module.exports =
  class Resource extends Sequelize.Model {
    static init(sequelize) {
      return super.init({
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        topic_id: {
          type: Sequelize.UUID,
          allowNull:false,
          references:{ model: 'topics', key: 'id' }
        },
        url: {
          type: Sequelize.STRING,
          unique: true
        },
        owner: {
          type: Sequelize.STRING,
          unique: true
        },
        moderator:{
          type: Sequelize.UUID,
          allowNull:false,
        }, 
        thumbnail:{
          type:Sequelize.BLOB,
          unique:true,
        }, 
        type: {
          type:Sequelize.ENUM('article', 'repo', 'video', 'tweet'),
          allowNull:false,
        },
        program: {
          type:Sequelize.STRING,
          allowNull:false,
        },
        add_time: {
          type:Sequelize.TIMESTAMP,
        },
        /*level: {
          type:Sequelize.ENUM('beginner','advanced'),
        },
        tags: {
          type:Sequelize.ARRAY(Sequelize.STRING),
        },
      }, { sequelize })
    };

    static associate(models) {
      this.hasMany(models.ResourceComments);
      this.hasMany(models.ResourceReports);
    }
  }*/