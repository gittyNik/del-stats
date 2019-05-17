var Resource = require('../models/link');
console.log(Resource.links);
var insert = Resource.links.sync({ force: false }).then(function() {
    return Resource.links.create({
        uid: '1',
        topic: 'Express',
        url: "www.google.com"
    });
});

var select = Resource.links.findAll({
    where: {
        topic: 'Express'
    }
}).then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});