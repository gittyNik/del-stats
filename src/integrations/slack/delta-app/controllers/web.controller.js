import { composeCatalystBreakoutMessage } from '../views/breakout.view';
import web from '../client';
import { User, getProfile } from '../../../../models/user';
import { Cohort, getCohortIdFromLearnerId } from '../../../../models/cohort';
import { CohortBreakout } from '../../../../models/cohort_breakout';
import { postMessage } from '../utility/chat';
import { getChannelIdForCohort } from '../../../../models/slack_channels';

const REVIEW_TEMPLATE = (team_number) => `Team: ${team_number}, Reviewer is reminding you to join the review. Please join from DELTA`;
const ASSESSMENT_TEMPLATE = 'Reviewer is reminding you to join the assessment. Please join from DELTA';
const LEARNER_REVIEW_TEMPLATE = 'Reviewer is reminding you to join the review. Please join from DELTA';
const BREAKOUT_TEMPLATE = 'Catalyst is reminding you to join the Breakout. Please join from DELTA';
const QUESTIONAIRE_TEMPLATE = 'Catalyst is reminding you to join the Question Hour. Please join from DELTA';

export const sendMessage = (req, res) => {
  const {
    userId, cohortId, breakoutId, topics,
  } = req.body;
  Promise.all([
    User.findByPk(userId),
    Cohort.findByPk(cohortId),
    CohortBreakout.findByPk(breakoutId),
  ])
    .then(([user, cohort, breakout]) => composeCatalystBreakoutMessage(user, cohort, breakout, topics))
    .then(web.chat.postMessage)
    .then(() => {
      res.status(200).json({
        text: 'Message sent to breakouts channel',
      });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const notifyLearnersInChannel = async (req, res) => {
  let {
    learner_id, text, cohort_id, type, team_number,
  } = req.body;
  if (learner_id) {
    var learner = await getProfile(learner_id);
    var { email } = learner;
    if (type === "reviews") {
      text = LEARNER_REVIEW_TEMPLATE;
    }
  }
  let slackUserResponse;
  try {
    if (learner_id) {
      slackUserResponse = await web.users.lookupByEmail({ email });
      var slackUserId = slackUserResponse.user.id;
    }
    if (typeof cohort_id === 'undefined') {
      cohort_id = await getCohortIdFromLearnerId(learner_id);
    }
    const channel_id = await getChannelIdForCohort(cohort_id);
    // console.log(channel_id);
    if (!text) {
      switch (type) {
        case 'reviews':
          text = REVIEW_TEMPLATE(team_number);
          break;
        case 'assessment':
          text = ASSESSMENT_TEMPLATE;
          break;
        case 'lecture':
          text = BREAKOUT_TEMPLATE;
          break;
        case 'question_hour':
          text = QUESTIONAIRE_TEMPLATE;
          break;
        // no default
      }
    }
    const updatedText = (req.body.cohort_id) ? `<!channel> ${text}` : `<@${slackUserId}> ${text}`;
    const post_res = await postMessage({ channel: channel_id, text: updatedText });
    return res.status(200).json({
      text: 'Message posted on the channel',
      data: {
        channel: post_res.channel,
        ts: post_res.ts,
        message: post_res.message,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      text: 'Failed to notify on the slack channel',
    });
  }
};
