/*
GET /api/firewall/applications/             -> get lists of all applications
GET /api/firewall/applications/:id          -> get an application with given id
GET /api/firewall/applications/live/        -> get the lists of all live applications

POST /api/firewall/applications/            -> add an application
PATCH /api/firewall/applications/:id        -> update an application with given id
DELETE /api/firewall/applications/:id       -> delete an application

POST /api/firewall/applications/:id/payment -> payment process of an application
*/
import uuid from 'uuid/v4';
import application from '../models/Application';

export const getAllApplication = (req, res) => {
	application.findAll()
	.then((data) => {res.status(200).json(data);})
	.catch(err => res.status(500).send(err));
}

export const getOneApplication = (req, res) => {
  // console.log(req.params.id);
	application.findAll({
		where: {
			id: req.params.id
		}
	})
	.then((data) => {res.status(200).json(data);})
	.catch(err => res.status(500).send(err));
}

export const getLiveApplication = (req, res) => {
  application.findAll({
		where: {
			status: "live"
		}
	})
	.then((data) => {res.status(200).json(data);})
	.catch(err => res.status(500).send(err));
}

export const addApplication = (req, res) => {
  let {user_id, cohort_applied, cohort_joining, status, payment_details} = req.body;
	// console.log(req.body);
	application.create({
		id: uuid(),
		user_id, 
		cohort_applied, 
		cohort_joining, 
		status, 
		payment_details,
	})
	.then(data=>res.status(201).send("application added", data))
	.catch(err=>console.status(500).log(err));
}

export const updateApplication = (req, res) => {
  let {user_id, cohort_applied, cohort_joining, status, payment_details} = req.body;
	// console.log(req.body);
  application.update({
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
  .then((data) => {res.send("updated", data);})
  .catch(err => res.status(500).send(err));
    // UPDATE post SET questions: {} WHERE id: 2;
}

export const deleteApplication = (req, res) => {
  // console.log(req.params.id);
	application.destroy({
		where: {
			id: req.params.id
		}
	})
	.then((data) => {res.send("deleted", data);})
	.catch(err => res.status(500).send(err));
}

export const payment = (req, res) => {
  let {payment_details} = req.body;
	// console.log(req.body);
  application.update({
			payment_details,
    }, {
      where: {
        id: req.params.id
      }
    })
  .then((data) => {res.send("payment updated", data);})
  .catch(err => res.status(500).send(err));
    // UPDATE post SET questions: {} WHERE id: 2;
}