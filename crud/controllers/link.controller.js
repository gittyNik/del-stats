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
            topic: req.params.name
        }
    }).then((data) => {
        res.json(data);
        console.log('Data retrieved');
    }).catch((err) => {
        console.log('entered catch');
        console.log(err);
    });
}
module.exports = { "select": select, "insert": insert };