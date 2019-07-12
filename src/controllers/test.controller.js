import uuid from 'uuid/v4';
import Test from '../models/test';
import TestQuestion from '../models/test_question';

export const getAllTests = (req,res) => {
  Test.findAll()
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

export const getTestById = (req, res) => {
  console.log(req.params.id);
  const id = req.params.id;
  Test.findAll({
    where: {
      id
    }
  })
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

/*
  TODO: randomly select the questions
  questions[{qid,answer,isCorrect,review,reviewed_by}]
*/
export const generateTestForLearner = application => {
  
  return TestQuestion.findAll().then(allQuestions => {
    // todo: add logic to filter which questions are actually needed
    return Test.create({
      application_id: application.id,
      id: uuid(),
      questions: allQuestions
    });
  });
}

export const updateTest = (req, res) => {
  const {sub_time} = req.body;
  const id = req.params.id;
  console.log("req_body",req.body);
  Test.update({
    sub_time,
  }, {
    where: {
      id
    }
  })
  .then(data => res.status(201).send(data))
  .catch(err => res.status(500))
}

//pending
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
  const {browsedUrls} = req.body;
  const history = JSON.parse(browsedUrls);
  const id = req.params.id;
  console.log("req_body",req.body);
  console.log(history.urls);
  Test.update({
    browser_history: history.urls
  }, {
    where: {
      id
    }
  })
  .then(data => res.status(201).send(data))
  .catch(err => res.sendStatus(500))
  // UPDATE post SET browserSession: {} WHERE id: 2;
}
