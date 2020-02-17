import { octokit, org } from "./git.auth.controller.js";

import { getLiveCohorts } from "../../../models/cohort";
import { getCurrentMilestoneOfCohort } from "../../../models/cohort_milestone";
import { getProfile } from "../../../models/user";

export const setUpMilestoneForCurrentWeek = () =>
	getLiveCohorts().then(cohorts =>
		cohorts.map(async cohort => {
			let ms = await getCurrentMilestoneOfCohort(cohort.id);
			return createMilestoneTeams(ms.id);
		})
	);
