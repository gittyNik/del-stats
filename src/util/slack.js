import request from 'superagent';
import scoreTest from './score';

const { SLACK_WEBHOOK } = process.env;

const formatResponse = test => {
  switch(test.purpose) {
    'know':
      return scoreTest(test);
    'think':
    'play':
      return test.responses.map(r => `\`${r.answer.answer}\``).join('\n');
  }
  return '<hidden content>';  // reflect
}

const buildFirewallResult = (fullName, phone, tests) =>  `{  "type": "home",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hello, *${fullName}* (${phone}) has finished firewall test. Here are the test results.\n\n "
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "${tests.map(t => `${t.purpose}:    \`${
          formatResponse(t)
        }\``).join('\n\n')}",
        "text": "know:    \`Growth Mindset\` \n Think:    \`fd 100 \\n rt 90 fd 100\` \n play:\n     \`console.log('test')\`\n\n    \`sdsdfs\`\n\n    \`sdfkshfs kffkshfd skdah kf sjkdf skdf skdf sa\`"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "What do you think of the candidate?"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Reject the candidate",
            "emoji": true
          },
          "value": "reject_firewall_applicant"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Schedule an interview",
            "emoji": true
          },
          "value": "review_firewall_applicant"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Send offer",
            "emoji": true
          },
          "value": "offer_firewall_applicant"
        }
      ]
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "_This message is automatically generated by Delta_"
        }
      ]
    }
  ]
}`;

/*
*  Send notification to slack on firewall application submission
*/
export const slackFirewallApplication = (application, phone) => request.post(SLACK_WEBHOOK)
  .set('Content-type', 'application/json')
  .send(buildFirewallResult(phone, phone, application.test_series));
