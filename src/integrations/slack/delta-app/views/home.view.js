import { footerBlock, dividerBlock, emptyNoteBlock } from './common';

export const buildLiveCohorts = (cohorts) => {
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

export const composeHome = (cohorts) => {
  console.log(cohorts);
  const result = {
    type: 'home',
    blocks: [
      ...buildLiveCohorts(cohorts),
      footerBlock,
    ],
  };

  return result;
};
