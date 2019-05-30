const Questions = require('../models/question');

export const getQuestions = (req,res) => {
    Questions.findAll()
    .then(questions=>{
        console.log(questions);
        res.status(200).json(questions);
    })
    .catch(err=>{
        console.log(err);
    })
}

export const addQuestions = (req,res) => {
    const data = {
        question:"Node.js is written in which language?",
        options: ["C", "C++", "JavaScript", "Java"],
        answer: [3,2]
    };
    let {question, options, answer} = data;
    Questions.create({
        question,
        options,
        answer
    })
    .then(questions=>res.send("success"))
    .catch(err=>console.log(err));
}

export const update = (req,res) => {
    res.send("updated");
}

export const deleteOne = (req,res) => {
    res.send("Deleted");
}
