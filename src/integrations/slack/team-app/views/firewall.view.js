import scoreTest from '../../../../controllers/firewall/test_score.controller';

const footerBlock = {
  type: 'context',
  elements: [
    {
      type: 'mrkdwn',
      text: '_For more info, visit <https://firewall.soal.io>_',
    },
  ],
};

const dividerBlock = {
  type: 'divider',
};

const emptyNoteBlock = {
  type: 'context',
  elements: [
    {
      type: 'mrkdwn',
      text: 'No data found',
    },
  ],
};

const buildFirewallCandidates = (applications) => {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Recent Firewall Candidates*\n',
      },
    },
    dividerBlock,
  ];
  applications = applications.filter(a => a.status === 'offered' || a.status === 'review_pending')
    .slice(-10);
  if (applications.length === 0) {
    blocks.push(emptyNoteBlock);
  } else {
    blocks.push({
      type: 'section',
      fields: applications.map((ca, i) => ({
        type: 'plain_text',
        text: `${i + 1}. ${ca['user.name']} <${ca['user.phone']}>${
          ca.status === 'offered' ? ':moneybag:' : ':time:'
        }`,
        emoji: true,
      })),
    });
  }
  return blocks;
};

const buildUpcomingCohorts = (applications) => {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Upcoming Cohorts*\n',
      },
    },
    dividerBlock,
  ];

  applications = applications.filter(a => a.status === 'joined');
  const cohorts = new Set(applications.map(a => a.cohort_joining));
  cohorts.forEach(cohort_id => {
    const cohortApplications = applications.filter(a => a.cohort_joining === cohort_id);
    const cohort = {
      id: cohortApplications[0]['cohort.id'],
      name: cohortApplications[0]['cohort.name'],
      location: cohortApplications[0]['cohort.location'],
      start_date: cohortApplications[0]['cohort.start_date'],
    };
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${cohort.name} ${cohort.start_date.getFullYear()} (${cohort.location})`,
      },
      accessory: {
        type: 'overflow',
        action_id: 'cohort_settings',
        options: [
          {
            text: {
              type: 'plain_text',
              text: 'Start Cohort',
              emoji: true,
            },
            value: cohort.id,
          },
        ],
      },
    });
    blocks.push({
      type: 'section',
      fields: cohortApplications.map((ca, i) => ({
        type: 'plain_text',
        text: `${i + 1}. ${ca['user.name']} <${ca['user.phone']}>${!ca['user.email'] ? ':warning:' : ''}`,
        emoji: true,
      })),
    });
    blocks.push(dividerBlock);
  });

  if (cohorts.size === 0) {
    blocks.push(emptyNoteBlock);
  }

  return blocks;
};

const buildLiveCohorts = (cohorts) => {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Live Cohorts*\n',
      },
    },
    dividerBlock,
  ];
  if (cohorts.length === 0) {
    blocks.push(emptyNoteBlock);
  } else {
    blocks.push({
      type: 'actions',
      elements: cohorts.map(cohort => ({
        type: 'button',
        action_id: `open_cohort_details.${cohort.id}`,
        text: {
          type: 'plain_text',
          text: `${cohort.name} ${cohort.start_date.getFullYear()} (${cohort.location})`,
          emoji: true,
        },
        value: cohort.id,
      })),
    });
  }
  return blocks;
};

export const composeHome = (applications, cohorts) => {
  const result = {
    type: 'home',
    blocks: [
      ...buildLiveCohorts(cohorts),
      ...buildFirewallCandidates(applications),
      ...buildUpcomingCohorts(applications),
      footerBlock,
    ],
  };

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
