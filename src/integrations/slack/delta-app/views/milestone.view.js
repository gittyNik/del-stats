
const footerBlock = {
  type: 'context',
  elements: [
    {
      type: 'mrkdwn',
      text: '_For more info, visit <https://delta.soal.io>_',
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

const buildTopicBlocks = (milestone) => {
  if (!milestone) return [];
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Topics for Milestone*',
      },
    },
    dividerBlock,
    ...milestone.topics.map(topic => {
      const started = topic['cohort_breakouts.status'] === 'started';
      // const time = `${topic['cohort_breakouts.time_scheduled']}`.split(' GMT')[0];
      const topicItem = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${topic.title} ${started ? ':soal:' : ''}`,
        },
      };
      if (!started) {
        topicItem.accessory = {
          type: 'button',
          action_id: `request_topic_breakout.${topic.id}`,
          text: {
            type: 'plain_text',
            text: 'Request Breakout',
            emoji: true,
          },
          value: `${topic.id}.${milestone.cohort_id}`,
        };
      }
      return topicItem;
    }),
  ];
  return blocks;
};

const buildMilestoneBlocks = (milestone) => {
  if (!milestone) return [emptyNoteBlock];
  const t = milestone.review_scheduled;
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${milestone['milestone.name']}*\n`,
      },
    },
    {
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `Review scheduled at ${t.getHours()}:${t.getMinutes() > 9 ? '' : '0'}${t.getMinutes()} on ${t.getDate()}/${1 + t.getMonth()}/${t.getFullYear()}`,
      }],
    },
    dividerBlock,
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${milestone['milestone.problem_statement']}`,
      },
    },
  ];

  return blocks;
};


export const composeMilestoneModal = milestone => {
  const result = {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: `${milestone ? milestone['cohort.name'] : 'Unavailable'} - Milestone`,
    },
    blocks: [
      ...buildMilestoneBlocks(milestone),
      ...buildTopicBlocks(milestone),
      dividerBlock,
      footerBlock,
    ],
  };
  return result;
};

export const composeBreakoutMessage = ({ topic, cohort, username }) => ({
  text: `Breakout on ${topic.title} is requested for ${cohort.name}`,
  blocks: [
    {
      type: 'context',
      elements: [{
        type: 'mrkdwn',
        text: `${cohort.name}-${cohort.start_date.getFullYear()} @${cohort.location}`,
      }],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Breakout on *${topic.title}* is requested (requested by @${username})`,
      },
    },
  ],
  channel: 'breakouts',
});
