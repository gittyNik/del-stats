/* eslint-disable import/prefer-default-export */

export const setPresence = (user) => user.setPresence({
  activity: {
    name: 'Heart!',
    type: 'LISTENING',
  },
  status: 'online',
});
