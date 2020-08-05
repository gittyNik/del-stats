import { composeCatalystBreakoutMessage } from "../views/breakout.view";
import web from "../client";
import { User, getProfile } from "../../../../models/user";
import { Cohort, getCohortIdFromLearnerId } from "../../../../models/cohort";
import { CohortBreakout } from "../../../../models/cohort_breakout";
import { postMessage } from '../utility/chat';
import { getChannelIdForCohort } from '../../../../models/slack_channels';

export const sendMessage = (req, res) => {
  const { userId, cohortId, breakoutId, topics } = req.body;
  Promise.all([
    User.findByPk(userId),
    Cohort.findByPk(cohortId),
    CohortBreakout.findByPk(breakoutId),
  ])
    .then(([user, cohort, breakout]) =>
      composeCatalystBreakoutMessage(user, cohort, breakout, topics)
    )
    .then(web.chat.postMessage)
    .then(() => {
      res.status(200).json({
        text: `Message sent to breakouts channel`,
      });
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const notifyLearnerInChannel = async (req, res) => {
  const { learner_id, text } = req.body;
  const learner = await getProfile(learner_id);
  const { email } = learner;
  let slackUserResponse;
  try {
    slackUserResponse = await web.users.lookupByEmail({ email });
    const slackUserId = slackUserResponse.user.id;
    const cohort_id = await getCohortIdFromLearnerId(learner_id);
    const channel_id = await getChannelIdForCohort(cohort_id);
    // console.log(channel_id);
    const updatedText = `<@${slackUserId}> ${text}`;
    const post_res = await postMessage({ channel: channel_id, text: updatedText });
    res.status(200).json({
      text: 'Message posted on the channel',
      data: {
        channel: post_res.channel,
        ts: post_res.ts,
        message: post_res.message,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      text: 'Failed to fetch slack user id from email',
    });
  }
};
