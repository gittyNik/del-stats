import { footerBlock, emptyNoteBlock } from './common';

export const buildResourceList = resources => resources.map(r => ({
  type: 'section',
  text: {
    type: 'mrkdwn',
    text: `*${r.title}*\n${r.url}\n${r.description}`,
  },
}));

export const composeResourceResults = (resources, query) => {
  const n = resources.length;
  const plural = n > 1 ? 's' : '';

  if (n === 0) {
    return {
      text: 'No results found.',
      blocks: [
        {
          type: 'context',
          elements: [{
            type: 'mrkdwn',
            text: `Searched for <${query}>`,
          }],
        },
        emptyNoteBlock,
        footerBlock,
      ],
    };
  }
  return {
    text: `Found ${n} result${plural} for you.`,
    blocks: [
      {
        type: 'context',
        elements: [{
          type: 'mrkdwn',
          text: `Found ${n} resource${plural} on <${query}>`,
        }],
      },
      ...buildResourceList(resources),
      footerBlock,
    ],
  };
};
