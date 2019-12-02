import scoreTest from '../../../firewall/test_score.controller';

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

const buildMilestoneBlocks = (milestone) => {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Milestone*\n',
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
      text: `${milestone['cohort.name']} - Milestone`,
    },
    blocks: [
      ...buildMilestoneBlocks(milestone),
      footerBlock,
    ],
  };

  return result;
};
