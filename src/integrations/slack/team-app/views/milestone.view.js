export const footerBlock = {
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

const buildTopicBlocks = (milestone, isProgram = false) => {
  const topics = isProgram ? milestone.programTopics : milestone.topics;
  console.log(isProgram, milestone.programTopics);
  if (!milestone || !topics) return [];
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Topics for ${isProgram ? 'any milestone' : 'current milestone'}*`,
      },
    },
    dividerBlock,
    ...topics.map(topic => {
      const completed = topic['cohort_breakouts.status'] === 'completed';
      // const time = `${topic['cohort_breakouts.time_scheduled']}`.split(' GMT')[0];
      const topicItem = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${topic.title} ${completed ? ':soal:' : ''}`,
        },
      };
      if (!completed) {
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
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Mark as review done',
          emoji: true,
        },
        action_id: `mark_milestone_reviewed.${milestone.id}`,
        value: `${milestone.id}`,
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
      ...buildTopicBlocks(milestone, true),
      dividerBlock,
      footerBlock,
    ],
  };
  return result;
};

export const milestoneReviewMessage = (milestone, cohort, username) => ({
  text: `Milestone review for ${milestone.name} is done for ${cohort.name}`,
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
        text: `Milestone review for *${milestone.name}* is done (marked by @${username})`,
      },
    },
  ],
  channel: process.env.SLACK_CLOCKWORK_CHANNEL,
});
