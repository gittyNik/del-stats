import logger from '../../../../util/logger';
import { hasDiscordSocialConnection } from '../controllers/user.controller';
import { discordOAuth2, discordBotOAuth2, oauthRedirect } from '../controllers/oauth.controller';

import {
  createState,
} from '../utils';

export const inviteBot = async (req, res) => {
  const deltaToken = req.headers.authorization.split(' ').pop();
  const state = await createState({ deltaToken, prompt: 'concent' });

  let uri = discordBotOAuth2({ state, prompt: 'concent' }).code.getUri();
  return res.redirect(uri);
};

export const joinDiscord = async (req, res) => {
  const { id } = req.jwtData.user;
  const deltaToken = req.headers.authorization.split(' ').pop();

  if (await hasDiscordSocialConnection({ user_id: id })) {
    const state = await createState({ deltaToken, prompt: 'none' });

    let uri = discordOAuth2({ state, prompt: 'none' }).code.getUri();
    return res.redirect(uri);
  }

  const state = await createState({ deltaToken, prompt: 'concent' });

  let uri = discordOAuth2({ state, prompt: 'concent' }).code.getUri();
  return res.redirect(uri);
};

export const oauthRedirectAPI = async (req, res) => {
  try {
    const stateKey = req.query.state;
    const { originalUrl } = req;

    const data = await oauthRedirect({ stateKey, originalUrl });

    return res.json(data);
  } catch (error) {
    logger.error(error);

    if (error.name === 'TokenExpiredError') {
      res.sendStatus(400).json({ message: 'JwtToken in the OAuth state expired! Try Joining again!', type: 'failure' });
    }

    if (error.name === 'JsonWebTokenError' && error.message === 'invalid token') {
      logger.error('Invalid token recieved from retrieveState!', error);
      res.sendStatus(400);
    }

    if (error.name === 'HttpBadRequest') {
      return res.status(error.statusCode).json({
        message: error.message,
        type: 'failure',
      });
    }

    logger.error(error);
    return res.status(500);
  }
};

export const oauthBotRedirect = async (req, res) => {
  // redirect to bot added successfully page
  res.json({ data: 'Bot added to server successfully!' });
};

export default oauthRedirect;
