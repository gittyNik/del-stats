import Express from 'express';
import { v4 as uuid } from 'uuid';
import web from '../client';
import { User } from '../../../../models/user';
import { SocialConnection } from '../../../../models/social_connection';
import { fetchResources } from '../controllers/resource.controller';
import logger from '../../../../util/logger';

const router = Express.Router();

// Apply body Parser
router.use(Express.urlencoded({ limit: '20mb', extended: false }));

// verify that the user already registered
const authenticate = (req, res, next) => {
  const { user_id: username } = req.body;

  // check if there is a social connection with workspace username
  SocialConnection.findOne({ where: { username } })
    .then(social_connection => {
      if (social_connection === null) {
        return Promise.reject(new Error('User not registered!'));
      }
      req.authData = {
        profile: social_connection.profile,
      };
      return next();
    })
    .catch(err => {
      logger.error(err);
      res.send('You are not authorized. Try `/delta register` command');
    });
};

const registerSlack = (slack_user_id) => web.users.info({ user: slack_user_id })
  // fetch the profile from slack server
  .then(response => response.user.profile)
  // find the user
  .then(profile => {
    const { email, phone } = profile;

    return User.findOne({ where: { email, phone } })
      .then(user => {
        if (user === null) {
          logger.error('User not found', email, phone);
          return Promise.reject(new Error('User not found'));
        }
        // logger.info('User matched!');
        return { user, profile };
      });
  })
  // save the social connection
  .then(({ user, profile }) => SocialConnection.create({
    id: uuid(),
    provider: `slack_${profile.team}`,
    profile,
    user_id: user.id,
    username: slack_user_id,
    email: user.email,
  }));

// User registration
router.use((req, res, next) => {
  const {
    command, text, user_id, user_name,
  } = req.body;
  if (command === '/delta' && text === 'register') {
    registerSlack(user_id)
      .then(social_connection => {
        // logger.info(social_connection);
        res.send(`Registration successful for @${user_name} !`);
      })
      .catch(err => {
        logger.error(err);
        res.send(`Registration failed for @${user_name} ! `
          + 'Please update your phone number. '
          + 'Check with the administrator if the details are matching');
      });
  } else {
    next();
  }
});

router.use(authenticate);

router.use((req, res) => {
  const { command, user_name } = req.body;

  switch (command) {
    case '/delta':
      res.send(`Welcome to SOAL @${user_name}!`);
      break;
    case '/find':
    case '/yoda':
      fetchResources(req, res);
      break;
    default:
      res.send('Unknown command!');
  }
});

export default router;
