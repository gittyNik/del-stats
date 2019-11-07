import request from 'superagent';

const { SLACK_WEBHOOK } = process.env;

/*
*  Send notification to slack on firewall application submission
*/
export const slackFirewallApplication = (application, phone) => {
  return request.post(SLACK_WEBHOOK)
    .set('Content-type', 'application/json') 
    .send({
      text:`An application is submitted on firewall using Phone#${phone} !`
    });
}
