import uuid from 'uuid/v4';
import Test from '../models/test';
import TestQuestion from '../models/test_question';
import {populateQuestionDetails} from './test_question.controller';
import _ from 'lodash';

export const getAllTests = (req,res) => {
  Test.findAll()
  .then(populateQuestionDetails)
  .then(data => res.status(200).json(data))
  .catch(err => res.status(500))
}

export const getTestByApplicationId = (req, res) => {
  const {id} = req.params;
  Test.findAll({where: { application_id: id }})
  .then(populateQuestionDetails)
  .then(testSeries => {
    res.status(200).json(testSeries);
  })
  .catch(err => res.status(500));
}

export const getTestById = (req, res) => {
  const {id} = req.params;
  Test.findAll({
    where: { id }})
  .then(populateQuestionDetails)
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

// NOTE: this logic must be changed if the question count is more than 3 digits
const generateTest = (template, application, allQuestions) => {
  /*
  test_series_example:[{
    duration: 15*60*1000, // Max durations in milliseconds
    purpose: 'know', // Purpose of having this test in series
    random: {generic: 5}, // Domains & counts of the random questions
    questions_fixed: [],  // An array of fixed questions
  }]
  */
  let questions = allQuestions.filter(q => template.questions_fixed && template.questions_fixed.includes(q.id));

  for(let domain in template.random){
    let randomQuestions = allQuestions.filter(q => q.domain===domain);
    questions = _.shuffle(randomQuestions)
      .splice(0,template.random[domain]).concat(questions);
  }

  let cleanQuestions = questions.map(q => {
    delete q.answer;
    return q;
  });

  const {purpose, duration} = template;
  return Test.create({
    id: uuid(),
    application_id: application.id,
    purpose,
    duration,
    questions: questions.map(q=>q.id),
  }).then(test => {
    test.questions = cleanQuestions;
    return test;
  });
}

// questions[{qid,answer,isCorrect,review,reviewed_by}]
export const generateTestSeries = (template, application) => {
  template = template.tests;
  return TestQuestion.findAll().then(allQuestions => {
    return Promise.all(template.map(testTemplate => generateTest(testTemplate, application, allQuestions)));
  }).then(test_series => {
    return {
      application,
      test_series,
    }
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