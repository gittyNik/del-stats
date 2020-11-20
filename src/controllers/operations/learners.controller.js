import { removeLearnerFromCohort, addLearnerToCohort, getCohortFromLearnerId } from '../../models/cohort';
import { getCohortLiveMilestones } from '../../models/cohort_milestone';
import { removeLearnerBreakouts } from '../../models/learner_breakout';
import { currentTeamOfLearner, removeLearnerFromMSTeam } from '../../models/team';
import { createApplication } from '../../models/application';
import { createUser, USER_ROLES, addUserStatus } from '../../models/user';

export const onLeaveController = async (req, res) => {
	try{
		const { learner_id, cohort_id } = req.body;
		const { id: user_id, name: user_name } = req.jwtData.user;
		let cohort = await getCohortFromLearnerId(learner_id);
		let milestone = await getCohortLiveMilestones(
			cohort.program_id,
			cohort.duration,
			cohort.id
		)
		milestone = milestone[0];
		let allOp = await Promise.all([
			addUserStatus(
				learner_id,
				"joining later",
				"",
				user_id,
				user_name,
				milestone.milestone_id,
				milestone['milestone.name'],
				cohort_id,
				cohort.name
			),
			removeLearnerFromCohort(learner_id, cohort_id),
			removeLearnerBreakouts(learner_id, cohort_id)
		]).then(async ([user, cohort, breakout]) => {
			let current_team_id = await currentTeamOfLearner(learner_id, cohort_id);
			if (!current_team_id) {
				return [user, cohort, breakout];
			}
			current_team_id = current_team_id.id;
			let team = await removeLearnerFromMSTeam(learner_id, current_team_id);
			return [user, cohort, breakout, team];
		})
		res.json({ data: allOp })
	} catch (err) {
		console.warn(err)
		res.status(500).send(err)
	}

}

export const addLearnerForDesign = async (req, res) => {
	try{
		const { name, phone, email, location, profile, cohort_applied_id, cohort_joining_id, is_isa, is_job_guarantee } = req.body;
		
		let user = await createUser({ name, phone, email, location, profile }, USER_ROLES.LEARNER)
		let application = await createApplication(user.id, cohort_applied_id, cohort_joining_id, 'archieved', is_isa, is_job_guarantee)
		let cohort = await addLearnerToCohort(user.id, cohort_joining_id)
		res.json({ data: { user, application, cohort} })
	} catch (err) {
		res.status(500).send(err)
	}	
}