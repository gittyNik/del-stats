const { SLACK_CLIQUE_WEBHOOK } = process.env;

export const sendCliqueMessage = () => SLACK_CLIQUE_WEBHOOK;

export const webhookUrl = SLACK_CLIQUE_WEBHOOK;
