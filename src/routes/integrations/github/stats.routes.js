import Express from "express";
import {
	numberOfLinesInEachMilestone,
	getTotalTeamAndUserCommits,
	getTotalUserCommitsPastWeek,
	numberOfAttemptedChallenges,
	getTotalCohortCommits,
	allStats
	// userAndTeamCommitsDayWise
} from "../../../integrations/github/controllers";

const router = Express.Router();

// router.get('/team/commits', getTotalTeamCommits);

// router.get('/user/commits', getTotalUserCommits);

router.get(
	"/commits/user/week/:milestone_repo_name",
	getTotalUserCommitsPastWeek
);

router.get(
	"/commits/team/user/:milestone_repo_name",
	getTotalTeamAndUserCommits
);

// router.get(
// 	"/commits/team/user/dayWise/:repo",
// 	userAndTeamCommitsDayWise
// );

router.get("/commits/cohort/:cohort_milestone_id", getTotalCohortCommits);

router.get("/challenges/user", numberOfAttemptedChallenges);

router.get("/lines/milestones/user/:cohort_id", numberOfLinesInEachMilestone);

router.get(`/all`, allStats)

export default router;
