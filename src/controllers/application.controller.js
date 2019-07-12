import uuid from 'uuid/v4';
import Application from '../models/application';
import {generateTestForLearner} = from './test.controller';

export const getAllApplications = (req, res) => {
	Application.findAll()
	.then(data => res.status(200).json(data))
	.catch(err => res.sendStatus(500))
}

export const getApplicationById = (req, res) => {
	const id = req.params.id;
  console.log(req.params.id);
	Application.findAll({
		where: {
			id
		}
	})
	.then(data => res.status(200).json(data))
	.catch(err => res.sendStatus(500))
}

export const getLiveApplications = (req, res) => {
  Application.findAll({
		where: {
			status: ['applied','review_pending','offered']
		}
	})
	.then(data => res.status(200).json(data))
	.catch(err => res.sendStatus(500))
}

export const addApplication = (req, res) => {
  const user_id = req.jwtData.user.id;
  const {cohort_applied} = req.body;
	console.log(req.body);
	Application.create({
		id: uuid(),
		user_id,
		cohort_applied,
		status: "applied",
	})
  .then(application => {
    generateTestForLearner(application).then(test=>{
      res.status(201).json({
        application,
        test
      });
    });
  })
	.catch(err=>res.sendStatus(500));
}

export const updateApplication = (req, res) => {
  const {cohort_joining, status} = req.body;
	console.log(req.body);
  Application.update({
			cohort_joining,
			status,
    }, {
      where: {
        id: req.params.id
      }
    })
  .then(data => res.status(200).json(data))
  .catch(err => res.sendStatus(500));
  // UPDATE post SET questions: {} WHERE id: 2;
}

export const deleteApplication = (req, res) => {
  const id = req.params.id;
  console.log(req.params.id);
	Application.destroy({
		where: {
			id
		}
	})
	.then(data => res.sendStatus(200))
	.catch(err => res.sendStatus(500));
}

export const payment = (req, res) => {
	console.log(req.body);
  const {payment_details} = req.body;
	const id = req.params.id;
	const payment = JSON.parse(payment_details);
  Application.update({
			payment_details: payment,
    }, {
      where: {
        id
      }
    })
  .then(data => res.status(200).json(data))
  .catch(err => res.sendStatus(500));
  // UPDATE post SET questions: {} WHERE id: 2;
}
