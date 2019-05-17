state=require('../index')
if (state.status == 'yes')
{
  var links = sequelize.define('history', {
    uid: {
      type: Sequelize.INTEGER
    },
    url: {
      type: Sequelize.STRING
    }
  }, {
    freezeTableName: true
  });

}


