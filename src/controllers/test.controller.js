/*
GET /api/firewall/tests/               -> list of all generated tests
GET /api/firewall/tests/:id            -> list specific test with id
GET /api/firewall/tests/:type/generate -> generate test (coding, logical, mindset etc)
PATCH /api/firewall/tests/:id          -> update specific test
PATCH /api/firewall/tests/:id/video    -> add screen recording to specific test
PATCH /api/firewall/tests/:id/history  -> add url visited for specific test
*/

const test = require('../../models/Test');

export const getAllTest = (req,res) => {
    test.findAll()
    .then(questions=>{
        console.log(questions);
        res.status(200).json(questions);
    })
    .catch(err=>{
        console.log(err);
    })
}

export const getOneTest = (req, res) => {
    // console.log(req.params.id);
    test.findAll({
        where: {
          id: req.params.id
        }
      })
    .then(questions=>{
        console.log(questions);
        res.status(200).json(questions);
    })
    .catch(err=>{
        console.log(err);
    })
}

export const generateSpecificTest = (req, res) => {
    // let {questions, user, generateTime, submitTime, type, browserSession} = req.body;
    console.log(req.params.type);
    console.log(req.body);
    // test.create({
    //     questions,
    //     user,
    //     generateTime,
    //     submitTime,
    //     type,
    //     browserSession
    // })
    // .then(tests=>res.send("insertion success"))
    // .catch(err=>console.log(err));
}

export const updateTest = (req, res) => {
    test.update({
        questions: {}
      }, {
        where: {
          id: req.params.id
        }
      });
      // UPDATE post SET questions: {} WHERE id: 2;
}

export const updateVideo = (req, res) => {
    test.update({
        questions: {}
      }, {
        where: {
          id: req.params.id
        }
      });
      // UPDATE post SET questions: {} WHERE id: 2;
}

export const updateBrowsedUrl = (req, res) => {
    test.update({
        browsersession: {}
      }, {
        where: {
          id: req.params.id
        }
      });
      // UPDATE post SET browserSession: {} WHERE id: 2;
}