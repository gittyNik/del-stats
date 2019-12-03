
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
  if (!milestone) return [emptyNoteBlock];
  const topics = ['sdfdsfs', 'sfdsfds', 'sadfdsfds'];
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Topics for Milestone*',
      },
    },

    ...topics.map(topic => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${topic}`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Mark as finished',
        },
        value: `${topic}`,
      },
    })),
  ];
  return blocks;
};

const buildMilestoneBlocks = (milestone) => {
  if (!milestone) return [emptyNoteBlock];
  const topics = ['sdfdsfs', 'sfdsfds', 'sadfdsfds'];
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${milestone['milestone.name']}*\n`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${milestone['milestone.problem_statement']}`,
      },
    },
    dividerBlock,
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
      footerBlock,
    ],
  };
  return result;
};
