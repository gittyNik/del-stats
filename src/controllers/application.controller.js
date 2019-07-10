import uuid from 'uuid/v4';
import Application from '../models/application';

export const getAllApplications = (req, res) => {
	Application.findAll()
	.then(data => res.status(200).json(data))
	.catch(err => res.sendStatus(500))
}

export const getApplicationById = (req, res) => {
  console.log(req.params.id);
	Application.findAll({
		where: {
			id: req.params.id
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
  let {cohort_applied} = req.body;
	console.log(req.body);
	Application.create({
		id: uuid(),
		user_id: "393a1571-29c5-4f5a-8a3d-2fe9682d768d", 
		cohort_applied, 
		status: "applied", 
	})
	.then(data=>res.status(201).json(data))
	.catch(err=>res.sendStatus(500));
}

export const updateApplication = (req, res) => {
  let {user_id, cohort_applied, cohort_joining, status, payment_details} = req.body;
	console.log(req.body);
  Application.update({
			user_id, 
			cohort_applied, 
			cohort_joining, 
			status, 
			payment_details,
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
  console.log(req.params.id);
	Application.destroy({
		where: {
			id: req.params.id
		}
	})
	.then(data => res.status(200).json(data))
	.catch(err => res.sendStatus(500));
}

export const payment = (req, res) => {
  let {payment_details} = req.body;
	// console.log(req.body);
  Application.update({
			payment_details,
    }, {
      where: {
        id: req.params.id
      }
    })
  .then(data => res.status(200).json(data))
  .catch(err => res.sendStatus(500));
  // UPDATE post SET questions: {} WHERE id: 2;
}
