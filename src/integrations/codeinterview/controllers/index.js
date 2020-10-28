import { 
	createInterview, 
	getInterviewById,
	getInterview
} from "../../../models/learner_interviews"

const getInterviewbyIdEndpoint = (req, res) => {
	const { id } = req.params;
	getInterviewById(id)
	.then((data) => res.send({
  			text: "Interview details",
  			data
  		}))
  	  .catch((err) => res.status(500).send(err));	
}

const getInterviewEndpoint = (req, res) => {
	const { learner_id, job_application_id, interview_round } = req.body;
	getInterview(learner_id, job_application_id, interview_round)
	.then((data) => res.send({
  			text: "Interview details",
  			data
  		}))
  	  .catch((err) => res.status(500).send(err));	
}

const createInterviewEndpoint = (req, res) => {
  	const { 
  		recruiter_ids,
  		learner_id,
  		job_application_id,
  		interview_date,
  		interview_round,
  		name
  	} = req.body;
  	createInterview({ recruiter_ids, learner_id, job_application_id, interview_date, interview_round}, name)
  		.then((data) => res.send({
  			text: "Successfully created Interview",
  			data
  		}))
  	  .catch((err) => res.status(500).send(err));	
};

const updateStatusEndpoint = (req, res) => {
	let interview;
	const { learner_id, job_application_id, interview_round, status } = req.body;
	interview = { status }
	if (req.body.interviewer_remarks) {
		interview = {
			...interview,
			interviewer_remarks: req.body.interviewer_remarks
		}
	}
	updateInterview(learner_id, job_application_id, interview_round, interview)
		.then((data) => res.send({
 			text: "Successfully updated Interview",
 			data
 		}))
  		.catch((err) => res.status(500).send(err));

}

const updateRemarksEndpoint = (req, res) => {
	let interview;
	const { learner_id, job_application_id, interview_round, interviewer_remarks } = req.body;
	
	updateInterview(learner_id, job_application_id, interview_round, { interviewer_remarks })
		.then((data) => res.send({
 			text: "Successfully updated Interview",
 			data
 		}))
  		.catch((err) => res.status(500).send(err));

}

const updateInterviewDateEndpoint = (req, res) => {
	let interview;
	const { learner_id, job_application_id, interview_round, interview_date } = req.body;
	
	updateInterview(learner_id, job_application_id, interview_round, { interview_date })
		.then((data) => res.send({
 			text: "Successfully updated Interview",
 			data
 		}))
  		.catch((err) => res.status(500).send(err));

}

export { 
	getInterviewbyIdEndpoint,
	getInterviewEndpoint,
	createInterviewEndpoint, 
	updateStatusEndpoint, 
	updateRemarksEndpoint, 
	updateInterviewDateEndpoint,
	createPad 
};
