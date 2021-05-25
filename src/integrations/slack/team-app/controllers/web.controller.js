import moment from 'moment';
import { Cohort } from '../../../../models/cohort';
import { CohortBreakout } from '../../../../models/cohort_breakout';
import { postMessage } from '../../delta-app/utility/chat';

import logger from '../../../../util/logger';

const CATALYST_NOTIFICATION_TEMPLATE = ({
  catalyst_name,
  cohort,
  topic,
  time_scheduled,
  updatedBy_name,
}) => `The Breakout on ${topic}scheduled on ${time_scheduled} for cohort ${cohort.cohort_name} ${cohort.format} ${cohort.city} is assigned to ${catalyst_name} by ${updatedBy_name}.`;

export const notifyCatalyst = (req, res) => {
  let {
    catalyst_name,
    cohort_breakout_id,
    topics,
  } = req.body;
  let updatedBy_name = req.jwtData.user.name;
  topics = topics.split('\n');
  let topicsStr = '';
  topics.map((topic, index) => {
    topicsStr = ((index === 0) ? `${topic}` : `${topicsStr}, ${topic}`);
  });
  CohortBreakout.findOne({
    where: {
      id: cohort_breakout_id,
    },
    include: [Cohort],
    raw: true,
  })
    .then(data => {
      let cohort_name = data['cohort.name'];
      let city = data['cohort.location'];
      let format = data['cohort.duration'] > 16 ? 'Full-time' : 'Part-time';
      const momentTime = moment(data.time_scheduled);
      const fullDate = momentTime.format('ddd, MMM Do');
      const fromTime = momentTime.format('h:mm A');
      let time_scheduled = `${fullDate}, ${fromTime}`;
      let notificationStr = CATALYST_NOTIFICATION_TEMPLATE({
        catalyst_name,
        cohort: {
          cohort_name,
          city,
          format,
        },
        topic: topicsStr,
        time_scheduled,
        updatedBy_name,
      });
      return notificationStr;
    })
    .then(async (str) => {
      console.log('!!!!!!!!!!!!!!!', str);
      await postMessage({
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
