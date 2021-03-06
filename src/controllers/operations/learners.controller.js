import {
  removeLearnerFromCohort,
  addLearnerToCohort,
  addLearnerStatus,
} from '../../models/cohort';
import { removeLearnerBreakouts } from '../../models/learner_breakout';
import { currentTeamOfLearner, removeLearnerFromMSTeam } from '../../models/team';
import { createApplication } from '../../models/application';
import { createUser, USER_ROLES } from '../../models/user';
import { stageLearnerFromDiscordChannel } from '../../integrations/discord/delta-app/controllers/channel.controller';
import { removeLearnerFromSlackChannel } from '../../models/slack_channels';
import logger from '../../util/logger';

export const removeLearnerFromTeam = async (learner_id, cohort_id) => {
  let current_team_id = await currentTeamOfLearner(learner_id, cohort_id);
  if (!current_team_id) {
    return null;
  }
  current_team_id = current_team_id.id;

  let team = await removeLearnerFromMSTeam(learner_id, current_team_id);
  return team;
};

export const onLeaveController = async (req, res) => {
  try {
    const { learner_id, cohort_id } = req.body;
    const updated_by_id = req.jwtData.user.id;
    const updated_by_name = req.jwtData.user.name;

    let allOp = await Promise.all([
      removeLearnerFromCohort(learner_id, cohort_id),
      removeLearnerBreakouts(learner_id, cohort_id),
    ]).then(async ([cohort, breakout]) => {
      await addLearnerStatus({
        user_id: learner_id,
        updated_by_id,
        updated_by_name,
        cohort_id,
        status: 'staged',
      });

      try {
        await removeLearnerFromSlackChannel(learner_id, cohort_id);
        await stageLearnerFromDiscordChannel({ learner_id, cohort_id });
      } catch (err) {
        logger.warn(`Failed to remove learner from slack/discord: ${learner_id}`, err);
      }

      const team = removeLearnerFromTeam(learner_id, cohort_id);
      if (team === null) {
        return [cohort, breakout];
      }
      return [cohort, breakout, team];
    });
    res.json({ data: allOp });
  } catch (err) {
    logger.console.error('Unable to delete learner: ', err);
    res.status(500);
  }
};

export const addLearnerForDesign = async (req, res) => {
  try {
    const {
      name, phone, email, location, profile,
      cohort_applied_id, cohort_joining_id, is_isa, is_job_guarantee,
    } = req.body;

    let user = await createUser({
      name, phone, email, location, profile,
    }, USER_ROLES.LEARNER);
    let application = await createApplication(user.id, cohort_applied_id, cohort_joining_id, 'archieved', is_isa, is_job_guarantee);
    let cohort = await addLearnerToCohort(user.id, cohort_joining_id);
    res.json({ data: { user, application, cohort } });
  } catch (error) {
    res.status(500).send(error);
  }
};
