import { removeLearnerFromCohort } from '../../models/cohort';
import { removeLearnerBreakouts } from '../../models/learner_breakout';
import { currentTeamOfLearner, removeLearnerFromMSTeam } from '../../models/team';

export const onLeaveController = async (req, res) => {
	try{
		const { learner_id, cohort_id } = req.body;
		let allOp = await Promise.all([
			removeLearnerFromCohort(learner_id, cohort_id),
			removeLearnerBreakouts(learner_id, cohort_id)
		]).then(async ([cohort, breakout]) => {
			let current_team_id = await currentTeamOfLearner(learner_id, cohort_id);
			if (!current_team_id) {
				return [cohort, breakout];
			}
			current_team_id = current_team_id.id;
			let team = await removeLearnerFromMSTeam(learner_id, current_team_id);
			return [cohort, breakout, team];
		})
		res.json({ data: allOp })
	} catch (err) {
		res.status(500).send(err)
	}

}