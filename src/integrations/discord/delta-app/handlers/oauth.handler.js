import logger from '../../../../util/logger';
import { hasDiscordSocialConnection } from '../controllers/user.controller';
import { discordOAuth2, discordBotOAuth2, oauthRedirect } from '../controllers/oauth.controller';

import {
  createState,
} from '../utils';

export const inviteBot = async (req, res) => {
  try {
    const deltaToken = req.headers.authorization.split(' ').pop();
    const state = await createState({ deltaToken, prompt: 'consent' });

    let uri = discordBotOAuth2({ state, prompt: 'consent' }).code.getUri();
    return res.redirect(uri);
  } catch (error) {
    logger.error(error);
    return res.status(error.statusCode ? error.statusCode : 500).json({ type: 'failure', message: error.message });
  }
};

export const joinDiscord = async (req, res) => {
  try {
    const { id } = req.jwtData.user;
    const deltaToken = req.headers.authorization.split(' ').pop();

    if (await hasDiscordSocialConnection({ user_id: id })) {
      const state = await createState({ deltaToken, prompt: 'none' });

      let uri = discordOAuth2({ state, prompt: 'none' }).code.getUri();
      // return res.redirect(uri);
      return res.send({ location: uri });
    }

    const state = await createState({ deltaToken, prompt: 'consent' });

    let uri = discordOAuth2({ state, prompt: 'consent' }).code.getUri();
    // return res.redirect(uri);
    return res.send({ location: uri });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};

export const oauthRedirectAPI = async (req, res) => {
  try {
    const { state, originalUrl } = req.query;
    const data = await oauthRedirect({ stateKey: state, originalUrl });

    return res.json(data);
  } catch (error) {
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
    return res.sendStatus(500);
  }
};

export const oauthBotRedirect = async (req, res) => {
  try {
    // redirect to bot added successfully page
    return res.json({ data: 'Bot added to server successfully!' });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
};

export default oauthRedirect;
