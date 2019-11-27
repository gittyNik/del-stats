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

const dividerBlock = {
  type: 'divider',
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
      dividerBlock,
    ],
  };

  const cohorts = new Set(applications.map(a => a.cohort_applied));
  cohorts.forEach(cohort_id => {
    const cohortApplications = applications.filter(a => a.cohort_applied === cohort_id);
    const cohort = {
      id: cohortApplications[0]['cohort.id'],
      name: cohortApplications[0]['cohort.name'],
      location: cohortApplications[0]['cohort.location'],
      start_date: cohortApplications[0]['cohort.start_date'],
    };
    result.blocks.push({
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
    result.blocks.push({
      type: 'section',
      fields: cohortApplications.map((ca, i) => ({
        type: 'plain_text',
        text: `${i + 1}. ${ca['user.name']} <${ca['user.phone']}>${!ca['user.email'] ? ':warning:' : ''}`,
        emoji: true,
      })),
    });
    result.blocks.push(dividerBlock);
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