import Express from 'express';
import web from './client';
import { User } from '../../../models/user';
import { SocialConnection } from '../../../models/social_connection';

const router = Express.Router();

// Apply body Parser
router.use(Express.urlencoded({ limit: '20mb', extended: false }));

// verify that the user already registered
const authenticate = (req, res, next) => {
  const { user_id: username } = req.body;

  // check if there is a social connection with workspace username
  SocialConnection.findOne({ where: { username } })
    .then(({ profile }) => {
      req.authData = { profile };
      next();
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(403);
    });
};

const registerSlack = (slack_user_id) => web.users.info({ user })
  // fetch the profile from slack server
  .then(response => response.user.profile);
  // validate the profile
  .then(profile => {
    if (email === null) {
      return Promise.reject(new Error('Invalid email'));
    }
    return profile;
  })
  // find the user
  .then(profile => {
    const { email, phone } = profile;

    return User.findOne({ where: { email, phone } })
      .then(user => {
        console.log('User matched!');
        return { user, profile };
      })
      .catch(err => {
        console.log(err);
        return Promise.reject(new Error('User not found'));
      });
  })
  // save the social connection
  .then(({ user, profile }) => SocialConnection.create({
    provider: 'slack',
    profile,
    user_id: user.id,
    username: slack_user_id,
    email: user.email,
  }));

router.use(authenticate);

router.use((req, res) => {
  const {
    text, user_id, command, user_name,
  } = req.body;

  authenticate(user_id)
    .then(() => {
      switch (command) {
        case '/delta':
          res.send(`Welcome to SOAL @${user_name}!`);
          break;
        default:
          res.send('Unknown command!');
      }
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(404);
    });
});

export default router;
