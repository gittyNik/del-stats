const express = require('express');

const router = express.Router();

const db = require('../config/database');

const Questions = require('../models/Questions');



router.get('/', (req, res)=>{
    Questions.findAll()
    .then(questions=>{
        console.log(questions);
        res.status(200).json(questions);
    })
    .catch(err=>{
        console.log(err);
    })
});

router.get('/addQuestions', (req, res)=>{
    const data = {
        question:"Node.js is written in which language?",
        options: ["C", "C++", "JavaScript", "Java"],
        answer: 3
    };
    let {question, options, answer} = data;
    Questions.create({
        question,
        options,
        answer
    })
    .then(questions=>res.redirect('/questions'))
    .catch(err=>console.log(err));

});

module.exports = router;