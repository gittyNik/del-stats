import uuid from 'uuid/v4';
import TestQuestion from '../models/test_question';

export const populateQuestionDetails = testSeries => {
  // Alternatively, the query can take an array and return only few questions
  return TestQuestion.findAll({raw:true}).then(allQuestions => {
    allQuestions = allQuestions.map(q => {
      delete q.answer;
      return q;
    });

    testSeries.forEach(test => {
      let questionIds = test.responses.map(response => response.question_id);
      test.questionDetails = allQuestions.filter(q => questionIds.includes(q.id));
    });

    return testSeries;
  });
}

export const getAllQuestions = (req,res) => {
  TestQuestion.findAll()
  .then(data => res.status(200).send(data))
  .catch(err => res.sendStatus(500));
}

// question, type{mcq/text/code}, domain{generic/tech/mindsets}
export const addQuestion = (req, res) => {
  const {question, type, domain} = req.body;
  const quest = JSON.parse(question);
  TestQuestion.create({
    id: uuid(),
    question: quest,
    type,
    domain,
  })
  .then(data=>res.status(201).send(data))
  .catch(err=>res.sendStatus(500));
}

export const deleteQuestion = (req, res) => {
  const {id} = req.params;
  TestQuestion.destroy({
    where: {
      id
    }
  }).then(data => res.sendStatus(200))
  .catch(err => res.sendStatus(500));
}

export const updateQuestion = (req, res) => {
  const {id} = req.params;
  const {question, type, domain} = req.body;
  const quest = JSON.parse(question);
  TestQuestion.update({
    question: quest,
    type,
    domain,
  }, {where: {id }})
  .then(data => res.status(200).send(data))
  .catch(err => res.sendStatus(500));
  // UPDATE post SET question: {} WHERE id: 2;
}
