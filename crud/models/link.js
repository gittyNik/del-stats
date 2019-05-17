const state = require('../index');
const Sequelize = require('sequelize');
//if (state.status == 'S') {
var Links = state.seq.define('links', {
    uid: {
        type: Sequelize.INTEGER
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
    return Links.create({
        /* uid: '1',
         topic: 'Express',
         url: "www.google.com"*/
    });
});
console.log(state.seq);
module.export = { 'Links': Links };
//}