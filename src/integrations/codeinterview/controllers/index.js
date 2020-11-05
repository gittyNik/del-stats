import { 
	createInterview, 
	getInterviewById,
	getInterview,
	getAllInterviewsForLearner,
	updateInterview
} from "../../../models/learner_interviews"
import { createInterviewRecuiterRelation } from "../../../models/learner_recruiter"
import { updateJobApplicationBypass } from "../../../models/job_application"
import { createPad, getPadById, endInterview } from "./pad.controller.js";

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

const getAllLearnerInterviewsEndpoint = (req, res) => {
	const { learner_id } = req.params
	getAllInterviewsForLearner(learner_id)
	.then((data) => res.send({
  		text: "Interview details",
  		data
  	}))
  	.catch((err) => {
  	 	console.warn (err)
  	 	res.status(500).send(err)
  	});	
}

const createInterviewEndpoint = async (req, res) => {
	let interview = null, interviewRecruiter = null, job_application
	try {
	  	const { 
	  		recruiter_ids,
	  		learner_id,
	  		job_application_id,
	  		interview_date,
	  		interview_round,
	  		interview_slot,
	  		interview_duration,
	  		name
	  	} = req.body;
	  	interview = await createInterview({ learner_id, job_application_id, interview_date, interview_round, interview_slot, interview_duration}, name)
	  	interviewRecruiter = await Promise.all(recruiter_ids.map(recruiter_id => createInterviewRecuiterRelation(interview.id, recruiter_id)))
	  	if (interview && interviewRecruiter) {
	  		job_application = await updateJobApplicationBypass({ status: "interview", interview_status: "scheduled"}, job_application_id)
	  	}
		res.send({
	  		text: "Successfully created Interview",
	  		data: {interview, interviewRecruiter, job_application}
	  	})	
	} catch (err) {
  	  	console.warn (err)
  	  	res.status(500).send(err)
  	  };	
  			
};

const updateStatusEndpoint = (req, res) => {
	let interview;
	const { learner_id, job_application_id, interview_round, final_status } = req.body;
	interview = { final_status }
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
	let interview, codepad_id=null;
	const { learner_id, job_application_id, interview_round, interviewer_remarks} = req.body;
	
	if (req.body.codepad_id) {
		codepad_id = req.body.codepad_id;
	}
	updateInterview(learner_id, job_application_id, interview_round, { interviewer_remarks })
		.then(data => {
			if (codepad_id) {
				return endInterview(codepad_id)
					.then (dt => ({
						updateInterview: data,
						endInterview: dt
					}))
			}
			return {
				updateInterview: data
			}
		})
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

const getCodepadDetailsEndpoint = (req, res) => {
	const { id } = req.params;
	getPadById(id)
		.then((data) => res.send({
 			text: "Successfully fetched Codepad details",
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
	getAllLearnerInterviewsEndpoint,
	getCodepadDetailsEndpoint,
	createPad,
	getPadById
};