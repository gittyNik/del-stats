import uuid from 'uuid/v4';
import TestQuestion from '../models/test_question';

export const getAllQuestions = (req,res) => {
  TestQuestion.findAll()
  .then(data => res.status(200).send(data))
  .catch(err => res.sendStatus(500));
}

// question, type{mcq/text/code}, domain{generic/tech/mindsets}
export const addQuestion = (req, res) => {
  // console.log(req.body);
  let {question, type, domain} = req.body;
  TestQuestion.create({
    id: uuid(),
    question,
    type,
    domain,
  })
  .then(data=>res.status(201).send(data))
  .catch(err=>res.sendStatus(500));
}

export const deleteQuestion = (req, res) => {
  // console.log(req.params.id);
  TestQuestion.destroy({
      where: {
        id: req.params.id
      }
    })
  .then(data => res.sendStatus(200))
  .catch(err => res.sendStatus(500));
}

export const updateQuestion = (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
  let {question, type, domain} = req.body;
  TestQuestion.update({
      question,
      type,
      domain,
    }, {
      where: {
        id: req.params.id
      }
    })
  .then(data => res.status(200).send(data))
  .catch(err => res.sendStatus(500));
  // UPDATE post SET question: {} WHERE id: 2;
}
