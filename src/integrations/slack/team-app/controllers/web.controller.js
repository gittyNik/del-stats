import moment from 'moment';
import { WebClient } from '@slack/web-api';
import { Cohort } from '../../../../models/cohort';
import { User } from '../../../../models/user';
import { CohortBreakout } from '../../../../models/cohort_breakout';
import { LearnerBreakout } from '../../../../models/learner_breakout';
import logger from '../../../../util/logger';

const { SLACK_TEAM_BOT_TOKEN } = process.env;
// Initialize
const web = new WebClient(SLACK_TEAM_BOT_TOKEN);

const createIdHead = ({ email, id }) => (email ? `${id}` : `<@${id}>`);

const CATALYST_NOTIFICATION_TEMPLATE = ({
  catalyst,
  cohort,
  breakout,
  slackLoggedInUserId,
  learner,
}) => {
  switch (breakout.type) {
    case 'lecture':
      return `${createIdHead(catalyst.slackCatalystId)} you have a *${breakout.topic}* BreakOut with *${cohort.cohort_name} ${cohort.format} ${cohort.city}* on *${breakout.time_scheduled}*. Please set a reminder for yourself. For any help/changes, reach out to ${createIdHead(slackLoggedInUserId)}.`;
    case 'mockinterview-aftercapstone':
      return `${createIdHead(catalyst.slackCatalystId)}, you have a Mock Interview scheduled with *${learner}* on *${breakout.time_scheduled}*. Please set a reminder for yourself. For any help/changes, reach out to ${createIdHead(slackLoggedInUserId)}`;
  }
};

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
    let learner;
    if (cohortDetails && cohortDetails.type === 'mockinterview-aftercapstone') {
      let learnerDetails = await LearnerBreakout
        .findOne({
          where: {
            cohort_breakout_id,
          },
          include: {
            model: User,
            attributes: ['name'],
          },
          raw: true,
        });
      learner = learnerDetails['user.name'];
    }
    let slackUserResponse; let slackLoggedInUserResponse; let slackCatalystId; let
      slackLoggedInUserId;
    try {
      slackUserResponse = await web.users.lookupByEmail({ email: catalyst_email });
      slackCatalystId = {
        email: false,
        id: slackUserResponse.user.id,
      };
    } catch (err) {
      if (err.message === 'An API error occurred: users_not_found') {
        slackCatalystId = {
          email: true,
          id: catalyst_email,
        };
      } else {
        throw err;
      }
    }
    try {
      slackLoggedInUserResponse = await web.users.lookupByEmail({ email: updatedBy_email });
      slackLoggedInUserId = {
        email: false,
        id: slackLoggedInUserResponse.user.id,
      };
    } catch (err) {
      if (err.message === 'An API error occurred: users_not_found') {
        slackLoggedInUserId = {
          email: true,
          id: updatedBy_email,
        };
      } else {
        throw err;
      }
    }

    let cohort_name = cohortDetails['cohort.name'];
    let city = cohortDetails['cohort.location'];
    let format = cohortDetails['cohort.duration'] > 16 ? 'Full-time' : 'Part-time';
    const momentTime = moment(cohortDetails.time_scheduled).utcOffset('+05:30');
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
      breakout: {
        type: cohortDetails.type,
        topic: topicsStr,
        time_scheduled,
      },
      slackLoggedInUserId,
      learner,
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
