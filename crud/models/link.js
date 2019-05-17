var state = require('../index');
var Sequelize = require('sequelize');
//if (state.status == 'S') {
var Links = state.seq.define('links', {
    uid: {
        type: Sequelize.INTEGER,
        //allowNull: false,
    },
    topic: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING
    }
}, {
    //freezeTableName: true
});
Links.sync({ force: false }).then(function() {
    /*console.log(Links.create({
    uid: '1',
    topic: 'Express',
    url: "www.google.com"
    }));*/
    return true;
});
console.log(Links);
module.export = { 'links': Links };
//}