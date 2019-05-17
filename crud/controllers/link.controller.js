var Resource = require('../models/link');
Links.sync({ force: true }).then(function() {
    return Links.create({
        id: '1',
        topic: 'Express',
        url: "www.google.com"
    });
});

Links.findAll({
    where: {
        id: '1'
    }
}).then((data) => {
    console.log(data);
}).catch((err) => {
    console.log(err);
});
