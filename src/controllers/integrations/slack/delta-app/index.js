import slackEvents from './event.controller';
import slackInteractions from './interaction.controller';

// to be used with express app
export const eventListener = slackEvents.requestListener();
export const interactionListener = slackInteractions.requestListener();
