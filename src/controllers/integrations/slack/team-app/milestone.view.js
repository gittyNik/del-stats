
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
      const topicItem = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${topic.title} ${started ? ':heavy_check_mark:' : ''}`,
        },
      };
      if (!started) {
        topicItem.accessory = {
          type: 'button',
          action_id: `mark_topic_finished.${topic.id}`,
          text: {
            type: 'plain_text',
            text: 'Mark as finished',
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
        text: `Review scheduled at ${t.getHours()}:${t.getHours()} on ${t.getDate()}/${1 + t.getMonth()}/${t.getFullYear()}`,
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
