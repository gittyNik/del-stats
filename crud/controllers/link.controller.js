var Resource = require('../models/link');
var insert = Resource.Links.sync({ force: true }).then(function() {
    return Resource.Links.create({
        uid: '1',
        topic: 'Express',
        url: "www.google.com"
    });
});

var select = Resource.Links.findAll({
    where: {
        topic: 'Express'
    }
}).then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});