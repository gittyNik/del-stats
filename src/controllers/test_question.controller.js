/*
GET /api/firewall/test_questions        -> get all questions
POST /api/firewall/test_questions       -> add a question
DELETE /api/firewall/test_questions/:id -> delete a question
PATCH /api/firewall/test_questions/:id  -> update a question
*/
const test_question = require('../../models/Test_Question');

export const getAllQuestion = (req,res) => {
    test_question.findAll()
    .then(questions=>{
        console.log(questions);
        res.status(200).json(questions);
    })
    .catch(err=>{
        console.log(err);
    })
}

export const addQuestion = (req, res) => {
        console.log(req.body.type);
        console.log(req.body.question);
        console.log(req.body.qimage);
        console.log(req.body.qtype);
        console.log(req.body);
        //console.log(req.body.answers[0]);
        //console.log(req.body.answers);
        // test_question.create({
        //     question,
        //     type,
        // })
        // .then(questions=>res.send("insertion success"))
        // .catch(err=>console.log(err));
}

export const deleteQuestion = (req, res) => {
    // console.log(req.params.id);
    test_question.destroy({
        where: {
          id: req.params.id
        }
      });
}

export const updateQuestion = (req, res) => {
    //console.log(req.params.id);
    test_question.update({
        question: {}
      }, {
        where: {
          id: req.params.id
        }
      });
      // UPDATE post SET question: {} WHERE id: 2;
}
