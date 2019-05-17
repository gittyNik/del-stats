var Resource=require('../models/link')
var insert=Resource.links.sync({force: false}).then(function () {
  return Resource.links.create({
    uid: 123,
    url: 'www.soal.io'
  });
});
var select= Resource.links.findAll({}).then((data) => {
    console.log(data);
  }).catch((err) => {
    console.log(err);
  });
 module.exports={"select":select,"insert":insert}