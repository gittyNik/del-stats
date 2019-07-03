import uuid from 'uuid/v4';
import Test from '../models/test';

export const getAllTest = (req,res) => {
  Test.findAll()
  .then((data) => {res.status(200).json(data);})
  .catch(err => res.status(500).send(err));
}

export const getOneTest = (req, res) => {
    // console.log(req.params.id);
    Test.findAll({
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
    Test.create({
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
  Test.update({
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
    Test.update({
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
    Test.update({
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