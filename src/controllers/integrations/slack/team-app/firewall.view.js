
export const createUpcomingCohortsView = (applications) => ({
  type: 'home',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Upcoming Cohorts*\n',
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Centaurus 2019',
      },
      accessory: {
        type: 'overflow',
        options: [
          {
            text: {
              type: 'plain_text',
              text: 'Start Cohort',
              emoji: true,
            },
            value: 'start_cohort',
          },
        ],
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'plain_text',
          text: '1. Rajesh',
          emoji: true,
        },
        {
          type: 'plain_text',
          text: '2. Saketh',
          emoji: true,
        },
        {
          type: 'plain_text',
          text: '3. Vamshi',
          emoji: true,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Centaurus 2019',
      },
      accessory: {
        type: 'overflow',
        options: [
          {
            text: {
              type: 'plain_text',
              text: 'Start Cohort',
              emoji: true,
            },
            value: 'start_cohort',
          },
        ],
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'plain_text',
          text: '1. Rajesh',
          emoji: true,
        },
        {
          type: 'plain_text',
          text: '2. Saketh',
          emoji: true,
        },
        {
          type: 'plain_text',
          text: '3. Vamshi',
          emoji: true,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'For more info, visit <https://firewall.soal.io>',
        },
      ],
    },
  ],
});
