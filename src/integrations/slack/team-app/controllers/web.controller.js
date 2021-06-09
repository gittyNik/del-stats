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
}) => (topic === '' ? `<@${catalyst.slackCatalystId}> you have a BreakOut with *${cohort.cohort_name} ${cohort.format} ${cohort.city}* at *${time_scheduled}*. Please set a reminder for yourself. For any help/changes, reach out to <@${slackLoggedInUserId}>.` : `<@${catalyst.slackCatalystId}> you have a *${topic}* BreakOut with *${cohort.cohort_name} ${cohort.format} ${cohort.city}* at *${time_scheduled}*. Please set a reminder for yourself. For any help/changes, reach out to <@${slackLoggedInUserId}>.`);

export const notifyCatalyst = async (req, res) => {
  try {
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

    const cohortDetails = await CohortBreakout.findOne({
      where: {
        id: cohort_breakout_id,
      },
      include: [Cohort],
      raw: true,
    });

    let slackUserResponse = await web.users.lookupByEmail({ email: catalyst_email });
    let slackLoggedInUserResponse = await web.users.lookupByEmail({ email: updatedBy_email });
    let slackCatalystId = slackUserResponse.user.id;
    let slackLoggedInUserId = slackLoggedInUserResponse.user.id;
    let cohort_name = cohortDetails['cohort.name'];
    let city = cohortDetails['cohort.location'];
    let format = cohortDetails['cohort.duration'] > 16 ? 'Full-time' : 'Part-time';
    const momentTime = moment(cohortDetails.time_scheduled);
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

    await web.chat.postMessage({
      channel: process.env.SLACK_PE_CATALYSTS,
      text: notificationStr,
    });

    return res.status(201).send({
      data: '',
      message: 'Slack notification sent successfully',
      type: 'success',
    });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};

export const notifyRequest = async (req, res) => {
  await web.chat.postMessage({
    channel: process.env.SLACK_PE_BREAKOUTS_SCHEDULING,
    text: 'A catalyst has requested a BreakOut',
  });
  res.status(201).send({
    data: '',
    message: 'Notified successfully',
    type: 'success',
  });
};