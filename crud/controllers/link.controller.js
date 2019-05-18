var Resource = require('../models/link');
var insert = function(req, res) {
    Resource.links.sync({ force: false }).then(function() {
        return Resource.links.create({
            uid: req.params.id,
            topic: 'Express',
            url: "www.google.com"
        });
    });
    res.send('Data Inserted Successfully');
}

var select = function(req, res) {
    Resource.links.findAll({
        where: {
            topic: 'Express'
        }
    }).then((data) => {
        console.log(data);
    }).catch((err) => {
        console.log(err);
    });
}
module.exports = { "select": select, "insert": insert };