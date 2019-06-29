/*
GET /api/firewall/tests/               -> list of all generated tests
GET /api/firewall/tests/:id            -> list specific test with id
GET /api/firewall/tests/:type/generate -> generate test (coding, logical, mindset etc)
PATCH /api/firewall/tests/:id          -> update specific test
PATCH /api/firewall/tests/:id/video    -> add screen recording to specific test
PATCH /api/firewall/tests/:id/history  -> add url visited for specific test
*/
import uuid from 'uuid/v4';
import test from '../models/Test';

export const getAllTest = (req,res) => {
  test.findAll()
  .then((data) => {res.status(200).json(data);})
  .catch(err => res.status(500).send(err));
}

export const getOneTest = (req, res) => {
    // console.log(req.params.id);
    test.findAll({
        where: {
          id: req.params.id
        }
      })
    .then((data) => {res.status(200).json(data);})
    .catch(err => res.status(500).send(err));
}

export const generateSpecificTest = (req, res) => {
    let {questions, user_id, gen_time, sub_time, browser_history} = req.body;
    // console.log(req.body);
    test.create({
      id: uuid(),
      questions,
      user_id,
      gen_time,
      sub_time,
      browser_history,
    })
    .then(data=>res.status(201).send("generation success", data))
    .catch(err=>console.status(500).log(err));
}

export const updateTest = (req, res) => {
  let {questions, user_id, gen_time, sub_time, browser_history} = req.body;
  // console.log(req.body);
  test.update({
      questions,
      user_id,
      gen_time,
      sub_time,
      browser_history,
    }, {
      where: {
        id: req.params.id
      }
    })
  .then((data) => {res.send("updated", data);})
  .catch(err => res.status(500).send(err));;
    // UPDATE post SET questions: {} WHERE id: 2;
}

export const updateVideo = (req, res) => {
    test.update({
        questions: {}
      }, {
        where: {
          id: req.params.id
        }
      })
    .then((data) => {res.send("updated", data);})
    .catch(err => res.status(500).send(err));;
      // UPDATE post SET questions: {} WHERE id: 2;
}

export const updateBrowsedUrl = (req, res) => {
    let {browser_history} = req.body;
    // console.log(req.body);
    test.update({
        browser_history
      }, {
        where: {
          id: req.params.id
        }
      })
    .then((data) => {res.send("updated", data);})
    .catch(err => res.status(500).send(err));
      // UPDATE post SET browserSession: {} WHERE id: 2;
}