var state=require('../index')
var Sequelize=require('sequelize');

 var links = state.seq.define('history1', {
    uid: {
      type: Sequelize.INTEGER
    },
    url: {
      type: Sequelize.ARRAY(Sequelize.STRING(2000))
    }
  }, {
    freezeTableName: true
  });
  links.sync({force: false}).then(function () {
    return true;
  });
  /*state.seq.authenticate().then(() => {
    console.log("Success!");
    var links = state.seq.define('history', {
      uid: {
        type: Sequelize.INTEGER
      },
      url: {
        type: Sequelize.STRING
      }
    }, {
      freezeTableName: true
    });
  
    /*Posts.sync({force: true}).then(function () {
      return Posts.create({
        title: 'Getting Started with PostgreSQL and Sequelize',
        content: 'Hello there'
      });
    });*/
    /*Posts.findAll({}).then((data) => {
      console.log(data);
    }).catch((err) => {
      console.log(err);
    });*/ // retrieve
    /*Posts.update({
      content: 'This is a tutorial to learn Sequelize and PostgreSQL'
    }, {
      where: {
        id: 1
      }
    }).then(() => {
      console.log('Updated');
    }).catch((e) => {
      console.log("Error"+e);
    });  */      // update
    /*Posts.destroy({where: {
      id: 1
    }}).then(() => {
      console.log("Deleted");
    }).catch((e) => {
      console.log("Error"+e);
    })
  }).catch((err) => {
    console.log(err);
  });*/
  //console.log(state.seq);
  module.exports={"links":links};




