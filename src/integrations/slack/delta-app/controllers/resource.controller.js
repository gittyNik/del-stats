import { createFromSlackAttachment } from '../../../../models/resource';

export const saveLink = (payload, respond, authData) => {
  // Logs the contents of the action to the console
  const { attachments } = payload.message;
  if (attachments && attachments[0]) {
    createFromSlackAttachment(attachments[0], authData.user_id)
      .then(resource => {
        const text = 'Thank you for your help! The link is queued for approval.';
        respond({ text }).catch(e => console.error(e));
      })
      .catch(err => {
        let text;
        if (err.name === 'SequelizeUniqueConstraintError') {
          text = 'Thank you for your help! The given link already exists.';
        } else {
          text = 'Unable to save the link';
        }
        respond({ text }).catch(e => console.error(e));
      });
  } else {
    respond({ text: 'Link not found! This action is only applicable for links' })
      .catch(e => console.error(e));
  }
};

export const fetchResources = (req, res) => {

};
