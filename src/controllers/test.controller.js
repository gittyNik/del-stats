import uuid from 'uuid/v4';
import Test from '../models/test';

export const getAllTests = (req,res) => {
  Test.findAll()
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

export const getTestById = (req, res) => {
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
export const generateTest = (req, res) => {
  // let {questions, user_id, gen_time, sub_time, browser_history} = req.body;
  let {questions} = req.body;
  console.log("req_body",req.body);
  console.log("questions",questions);
  Test.create({
    id: uuid(),
    questions,
    user_id,
  })
  .then(data=>res.status(201).send(data))
  .catch(err=>res.status(500))
}

export const updateTest = (req, res) => {
  let {sub_time} = req.body;
  console.log("req_body",req.body);
  console.log("sub_time",sub_time);
  Test.update({
      sub_time,
    }, {
      where: {
        id: req.params.id
      }
    })
  .then(data => res.status(201).send(data))
  .catch(err => res.status(500))
}

export const updateVideo = (req, res) => {
  res.status(501).send("not implemented")
  // Test.update({
  //     questions: {}
  //   }, {
  //     where: {
  //       id: req.params.id
  //     }
  //   })
  // .then(data => res.status(201).send(data))
  // .catch(err => res.status(500))
  // UPDATE post SET questions: {} WHERE id: 2;
}

export const updateBrowsedUrl = (req, res) => {
  let {browsedUrls} = req.body;
  console.log("req_body",req.body);
  console.log(browsedUrls.length);
  Test.update({
      browser_history: browsedUrls
    }, {
      where: {
        id: req.params.id
      }
    })
  .then(data => res.status(201).send(data))
  .catch(err => res.status(500).send("update error"))
  // UPDATE post SET browserSession: {} WHERE id: 2;
}
