var state = require('../index');
var Sequelize = require('sequelize');
var links = state.seq.define('urldb', {
    uid: {
        type: Sequelize.INTEGER,
    },
    topic: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING,
        unique: true
    }
}, {
    freezeTableName: true
});
links.sync({ force: false }).then(function() {
    return true;
});
module.exports = { "links": links };