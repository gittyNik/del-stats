import { getUserTweets } from './search.controller.js';

const getUserTweetsWrapper = async (req, res) => {
  const { handle } = req.params;
  getUserTweets(handle)
    .then(data => res.send({ data }))
    .catch(err => res.status(500).send(err));
};

export { getUserTweetsWrapper };
