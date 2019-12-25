import { createFromSlackAttachment, searchResources } from '../../../../models/resource';
import web from '../client';
import { composeResourceResults, composeResourceNotification } from '../views/resource.view';

export const notifyModerator = resource => {
  console.log('Notifying resource addition');
  return web.chat.postMessage(composeResourceNotification(resource));
};

export const saveLink = (payload, respond, authData) => {
  // Logs the contents of the action to the console
  const { attachments } = payload.message;
  if (attachments && attachments[0]) {
    createFromSlackAttachment(attachments[0], authData.user_id)
      .then(resource => {
        const text = 'Thank you for your help! The link is queued for approval.';
        Promise.all([
          notifyModerator(resource),
          respond({ text }),
        ])
          .catch(e => console.error(e));
      })
      .catch(err => {
        let text;
        if (err.name === 'SequelizeUniqueConstraintError') {
          text = 'Thank you for your help! The given link already exists.';
        } else {
          text = 'Unable to save the link';
          console.error(err);
        }
        respond({ text }).catch(e => console.error(e));
      });
  } else {
    respond({ text: 'Link not found! This action is only applicable for links' })
      .catch(e => console.error(e));
  }
};

export const fetchResources = (req, res) => {
  const text = req.body.text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, ' ');

  searchResources(text)
    .then(resources => {
      res.send(composeResourceResults(resources, text));
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(404);
    });
};
