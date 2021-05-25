import moment from 'moment';
import { WebClient } from '@slack/web-api';
import { Cohort } from '../../../../models/cohort';
import { CohortBreakout } from '../../../../models/cohort_breakout';
import logger from '../../../../util/logger';

const { SLACK_TEAM_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_TEAM_BOT_TOKEN);

const CATALYST_NOTIFICATION_TEMPLATE = ({
  catalyst,
  cohort,
  topic,
  time_scheduled,
  slackLoggedInUserId,
}) => (topic === '' ? `The Breakout scheduled on *${time_scheduled}* for cohort *${cohort.cohort_name} ${cohort.format} ${cohort.city}* is assigned to <@${catalyst.slackCatalystId}> by <@${slackLoggedInUserId}>.` : `The Breakout on *${topic}* scheduled on *${time_scheduled}* for cohort *${cohort.cohort_name} ${cohort.format} ${cohort.city}* is assigned to <@${catalyst.slackCatalystId}> by <@${slackLoggedInUserId}>.`);

export const notifyCatalyst = (req, res) => {
  let {
    catalyst_email,
    cohort_breakout_id,
    topics,
  } = req.body;

  let topicsStr = '';
  let updatedBy_email = req.jwtData.user.email;
  if (topics) {
    topics = topics.split('\n');
    topics.map((topic, index) => {
      topicsStr = ((index === 0) ? `${topic}` : `${topicsStr}, ${topic}`);
    });
  }

  CohortBreakout.findOne({
    where: {
      id: cohort_breakout_id,
    },
    include: [Cohort],
    raw: true,
  })
    .then(async data => {
      let slackUserResponse = await web.users.lookupByEmail({ email: catalyst_email });
      let slackLoggedInUserResponse = await web.users.lookupByEmail({ email: updatedBy_email });
      let slackCatalystId = slackUserResponse.user.id;
      let slackLoggedInUserId = slackLoggedInUserResponse.user.id;
      let cohort_name = data['cohort.name'];
      let city = data['cohort.location'];
      let format = data['cohort.duration'] > 16 ? 'Full-time' : 'Part-time';
      const momentTime = moment(data.time_scheduled);
      const fullDate = momentTime.format('ddd, MMM Do');
      const fromTime = momentTime.format('h:mm A');
      let time_scheduled = `${fullDate}, ${fromTime}`;
      let notificationStr = CATALYST_NOTIFICATION_TEMPLATE({
        catalyst: {
          slackCatalystId,
        },
        cohort: {
          cohort_name,
          city,
          format,
        },
        topic: topicsStr,
        time_scheduled,
        slackLoggedInUserId,
      });
      return notificationStr;
    })
    .then(async (str) => {
      await web.chat.postMessage({
        channel: process.env.SLACK_PE_CATALYSTS,
        text: str,
      });
      res.status(201).send({
        data: '',
        message: 'Slack notification sent successfully',
        type: 'success',
      });
    })
    .catch(err => {
      logger.error(err);
      return res.status(500);
    });
};
