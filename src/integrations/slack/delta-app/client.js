import { WebClient } from '@slack/web-api';

const { SLACK_DELTA_BOT_TOKEN } = process.env;

// Initialize
const web = new WebClient(SLACK_DELTA_BOT_TOKEN);

export default web;
