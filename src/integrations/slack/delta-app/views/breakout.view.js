import moment from 'moment';

// eslint-disable-next-line import/prefer-default-export
export const composeCatalystBreakoutMessage = (user, cohort, breakout, topics) => ({
  text: 'Catalyst has requested to take the breakout',
  blocks: [{
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${user.name}* has requested to take the breakout on *${topics}*`,
    },
  },
  {
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `*Cohort:* ${cohort.name}-${cohort.start_date.getFullYear()} @${cohort.location},`,
    },
    {
      type: 'mrkdwn',
      text: `*Format:* ${cohort.duration === 26 ? 'Part-time' : 'Full-time'},`,
    },
    {
      type: 'mrkdwn',
      text: `*Date:* ${moment(breakout.time_scheduled).format('ddd, MMM Do YYYY, h:mm a')}`,
    },
    ],
  },
  {
    type: 'divider',
  },
  ],
  channel: 'delta-slack-messages-testing',
});
