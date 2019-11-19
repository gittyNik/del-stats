import slackInteractions from './interaction.controller';
import slackEvents from './event.controller';
import { slackFirewallApplication } from '../../../util/slack';

// to be used with express app
export const interactionListener = slackInteractions.requestListener();
export const eventListener = slackEvents.requestListener();

export slackFirewallApplication;