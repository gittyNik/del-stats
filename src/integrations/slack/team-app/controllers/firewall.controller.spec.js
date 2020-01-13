import models from '../../../../models';
import { sendFirewallDailyStats } from './firewall.controller';

const { connection } = models;

// Connection should be closed everytime models are used
afterAll(() => connection.close());

it('should send a message to slack channel', () => {
  return sendFirewallDailyStats()
    .then(msg => {
      expect(msg).toBeTruthy();
    })
});
