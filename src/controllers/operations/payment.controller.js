import { getApplicantPlans } from '../../models/payment_details';

const getApplicantPlansEndpoint = (req, res) => {
	const { id: applicant_id } = req.params;
	getApplicantPlans(applicant_id).then(data => res.send(data)).catch(err => res.send(err))
}

export {
	getApplicantPlansEndpoint
}