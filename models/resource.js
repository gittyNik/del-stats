import Sequelize from 'sequelize';

  class Resource extends Sequelize.Model {
    static init(sequelize) {
      return Sequelize.Model.init({
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        /*topic_id: {
          type: Sequelize.UUID,
          allowNull:false,
          references:{ model: 'topics', key: 'id' }
        },*/
        url: {
          type: Sequelize.STRING,
          unique: true
        },
        type: {
          type:Sequelize.ENUM('article', 'repo', 'video', 'tweet'),
          allowNull:false,
        },
        program: {
          type:Sequelize.STRING,
          allowNull:false,
        },
        tags: {
          type:Sequelize.ARRAY(Sequelize.STRING),
        },
      }, {sequelize })
      
    };

    static associate(models) {
      this.hasMany(models.ResourceComments);
      this.hasMany(models.ResourceReports);
    }
    static create(data) {
      let{topic_ids,url,type,program}=data
      return this.create({
        topic_ids,url,type,program
      });
  }
}
module.exports = {"Resource":Resource}
/*links=new Resource;
links.url="www.google.com";
links.program="xyz";
links.type="article";
links.topic_ids=Sequelize.UUIDV4;


var links =Resource.build({ topic_ids:Sequelize.UUIDV4,
  url: "www.google.com",
  type:'article',
  program:'xyz' });



links.save().then(console.log("success"))
.catch(console.log("failure"))*/