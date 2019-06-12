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
    
}

export const deleteQuestion = (req, res) => {
    
}

export const updateQuestion = (req, res) => {
    
}
