import uuid from 'uuid/v4';
import Test from '../models/test';
import TestQuestion from '../models/test_question';

export const getAllTests = (req,res) => {
  Test.findAll()
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

export const getTestByApplicationId = (req, res) => {
  const {id} = req.params;
  Test.findAll({
    where: { application_id: id }})
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

export const getTestById = (req, res) => {
  const {id} = req.params;
  Test.findAll({
    where: { id }})
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

export const updateTest = (req, res) => {
  const {sub_time} = req.body;
  const {id} = req.params;
  Test.update({
    sub_time,
  }, {
    where: { id }})
  .then(data => res.status(201).send(data))
  .catch(err => res.status(500))
}

export const updateBrowsedUrl = (req, res) => {
  const {browsedUrls} = req.body;
  const history = JSON.parse(browsedUrls);
  console.log(history);
  const {id} = req.params;
  Test.update({
    browser_history: history.urls
  }, {
    where: { id }})
  .then(data => res.status(201).send(data))
  .catch(err => res.sendStatus(500))
}

// questions[{qid,answer,isCorrect,review,reviewed_by}]
export const generateTestForLearner = application => {
  return TestQuestion.findAll().then(allQuestions => {
    let generic = [];
    let tech = [];
    let mindsets = [];
    let qid = [];
    for(let i=0;  i<allQuestions.length; i++){
      if(allQuestions[i].domain == 'generic'){
        generic.push(allQuestions[i].id);
      }
      else if(allQuestions[i].domain == 'tech'){
        tech.push(allQuestions[i].id);
      }
      else if(allQuestions[i].domain == 'mindsets'){
        mindsets.push(allQuestions[i].id);
      }
    }
  
    for(let i=0; i<3; i++){
      let id = generic[Math.floor(Math.random()*generic.length)];
      generic.splice(generic.indexOf(id), 1);
      qid.push(id);
    }
    
    for(let i=0; i<3; i++){
      let id = tech[Math.floor(Math.random()*tech.length)];
      tech.splice(tech.indexOf(id), 1);
      qid.push(id);
    }
  
    for(let i=0; i<3; i++){
      let id = mindsets[Math.floor(Math.random()*mindsets.length)];
      mindsets.splice(mindsets.indexOf(id), 1);
      qid.push(id);
    }

    let questions = [];
    for(let i=0; i<qid.length; i++){
      let quest = new Object();
      quest.qid=qid[i];
      quest.answer = null;
      quest.isCorrect = null;
      quest.review = null;
      quest.reviewed_by = null;
      questions.push(quest);
    }
  
    return Test.create({
      application_id: application.id,
      id: uuid(),
      questions
    });
  });
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