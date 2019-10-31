const apidoc = require('apidoc');

const doc = apidoc.createDoc({src: __dirname + '/../src'});
const apiSpec = JSON.parse(doc.data);

module.exports = apiSpec;
