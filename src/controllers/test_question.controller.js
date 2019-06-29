/*
GET /api/firewall/test_questions        -> get all questions
POST /api/firewall/test_questions       -> add a question
DELETE /api/firewall/test_questions/:id -> delete a question
PATCH /api/firewall/test_questions/:id  -> update a question
*/
import uuid from 'uuid/v4';
import test_question from '../models/Test_Question';

export const getAllQuestion = (req,res) => {
    test_question.findAll()
    .then((data) => {res.json(data);})
    .catch(err => res.status(500).send(err));
}

export const addQuestion = (req, res) => {
  // console.log(req.body);
  let {question, type, domain} = req.body;
  test_question.create({
    id: uuid(),
    question,
    type,
    domain,
  })
  .then(questions=>res.status(201).send("insertion success"))
  .catch(err=>console.status(500).log(err));
}

export const deleteQuestion = (req, res) => {
    // console.log(req.params.id);
    test_question.destroy({
        where: {
          id: req.params.id
        }
      })
    .then((data) => {res.send("deleted", data)})
    .catch(err => res.status(500).send(err));
}

export const updateQuestion = (req, res) => {
    //console.log(req.params.id);
    // console.log(req.body);
    let {question, type, domain} = req.body;
    test_question.update({
        question,
        type,
        domain,
      }, {
        where: {
          id: req.params.id
        }
      })
    .then((data) => {res.send("updated", data);})
    .catch(err => res.status(500).send(err));
      // UPDATE post SET question: {} WHERE id: 2;
}
