import scoreTest from '../../../firewall/test_score.controller';

const footerBlock = {
  type: 'context',
  elements: [
    {
      type: 'mrkdwn',
      text: '_For more info, visit <https://firewall.soal.io>_',
    },
  ],
};
export const createUpcomingCohortsView = (applications) => {
  const emptyNoteBlock = {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: 'No data found',
      },
    ],
  };

  const result = {
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

    ],
  };

  const cohorts = new Set(applications.map(a => a['cohort.name']));
  cohorts.forEach(cohort_id => {
    result.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: cohort_id,
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
    });
    result.blocks.push({
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
    });
    result.blocks.push({
      type: 'divider',
    });
  });

  if (cohorts.length === 0) {
    result.blocks.push(emptyNoteBlock);
  }

  result.blocks.push(footerBlock);
  return result;
};


const formatResponse = (test) => {
  switch (test.purpose) {
    case 'know':
      return scoreTest(test);
    case 'think':
    case 'play':
      return test.responses.map(r => `\`\`\`${r.answer ? r.answer.answer : ' '}\`\`\``).join('\n');
    default:
      return '_<hidden content>_'; // reflect
  }
};

export const buildFirewallResult = (fullName, phone, tests) => {
  const result = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hello, *${fullName}* (${phone}) has finished firewall test. Here are the test results.\n\n`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${tests.map(t => `${t.purpose}:    ${formatResponse(t)}`).join('\n\n')}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'What do you think of the candidate?',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Reject the candidate',
              emoji: true,
            },
            value: 'reject_firewall_applicant',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Schedule an interview',
              emoji: true,
            },
            value: 'review_firewall_applicant',
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Send offer',
              emoji: true,
            },
            value: 'offer_firewall_applicant',
          },
        ],
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '_This message is automatically generated by Delta_',
          },
        ],
      },
    ],
  };
  return result;
};
