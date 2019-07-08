import uuid from 'uuid/v4';
import Test from '../models/test';

export const getAllTest = (req,res) => {
  Test.findAll()
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

export const getOneTest = (req, res) => {
  // console.log(req.params.id);
  Test.findAll({
      where: {
        id: req.params.id
      }
    })
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

//questions[{qid,answer,isCorrect,review,reviewed_by}]
export const generateSpecificTest = (req, res) => {
  // let {questions, user_id, gen_time, sub_time, browser_history} = req.body;
  let {questions, user_id} = req.body;
  console.log("req_body",req.body);
  console.log("questions",questions);
  console.log("userid",user_id);
  Test.create({
    id: uuid(),
    questions,
    user_id,
  })
  .then(data=>res.status(201).send(data))
  .catch(err=>res.status(500))
}

export const updateTest = (req, res) => {
  let {questions, sub_time} = req.body;
  console.log("req_body",req.body);
  console.log("sub_time",sub_time);
  console.log("questions",questions);
  Test.update({
      sub_time,
      questions
    }, {
      where: {
        id: req.params.id
      }
    })
  .then(data => res.status(201).send(data))
  .catch(err => res.status(500))
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
  .then(data => res.status(201).send(data))
  .catch(err => res.status(500))
  // UPDATE post SET questions: {} WHERE id: 2;
}

export const updateBrowsedUrl = (req, res) => {
  let {browser_history} = req.body;
  console.log("req_body",req.body);
  console.log("browser_history",browser_history.length);
  Test.update({
      browser_history
    }, {
      where: {
        id: req.params.id
      }
    })
  .then(data => res.status(201).send(data))
  .catch(err => res.status(500).send("update error"))
  // UPDATE post SET browserSession: {} WHERE id: 2;
}