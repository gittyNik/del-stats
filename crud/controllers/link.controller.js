var Resource = require('../models/link');
var insert = function(req, res) {
    Resource.links.sync({ force: false }).then(function() {
            return Resource.links.create({
                    uid: req.params.uid,
                    topic: req.params.topic,
                    url: req.params.url

                })
                .catch((err) => {
                    //console.log('cATHGD          GGGCCCCCCCCCCCCCCCCCNG');
                    res.end("catch");


                });
            console.log(req.body);
        })
        .catch((err) => {
            res.end("catch");
            console.log(err);
        });
    res.send('Data Inserted Successfully');
}

var select = function(req, res) {
    Resource.links.findAll({
        where: {
            topic: req.params.topic
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