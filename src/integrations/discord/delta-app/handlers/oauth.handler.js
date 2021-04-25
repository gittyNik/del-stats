import jwt from 'jsonwebtoken';
import logger from '../../../../util/logger';
import { getUser, addDiscordSocialConnection, hasDiscordSocialConnection } from '../controllers/user.controller';
import { discordOAuth2, discordBotOAuth2 } from '../controllers/oauth.controller';
import discordBot from '../client';

import { User } from '../../../../models/user';
import { HttpBadRequest } from '../../../../util/errors';
import { createState, retrieveState, removeState } from '../utils';

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

const oauthRedirect = async (req, res) => {
  try {
    const stateKey = req.query.state;
    const stateData = await retrieveState({ key: stateKey });

    if (!stateData || !stateData.deltaToken) {
      throw new HttpBadRequest('Invalid stateData! retrieveState');
    }

    const deltaJwtData = await jwt.verify(stateData.deltaToken, process.env.JWT_SECRET);
    const deltaUser = await User.findOne(
      {
        where: {
          id: deltaJwtData.userId,
        },
      },
      { raw: true },
    );

    if (deltaUser === null) {
      await removeState({ key: stateKey });
      throw new HttpBadRequest('Bad Request! Messed up JWT! Couldn\'t find user in delta');
    }

    // get discord user token to do stuff on their behalf
    const authRes = await discordOAuth2({ state: stateKey }).code.getToken(req.originalUrl);
    const user = await getUser(authRes.accessToken);
    await discordBot.guild.available({});

    if (stateData.prompt === 'none') {
      await removeState({ key: stateKey });

      return res.json({
        message: 'oauth success',
        type: 'success',
        data: {
          token: authRes.accessToken,
          user: user.data,
        },
      });
    }

    if (stateData.prompt === 'concent') {
      // user has first time clicked join
      await addDiscordSocialConnection(deltaUser, user);

      // add user to server

      // give role

      await removeState({ key: stateKey });

      return res.json({
        message: 'oauth success',
        type: 'success',
        data: {
          token: authRes.accessToken,
          user: user.data,
        },
      });
    }

    throw new HttpBadRequest('Bad Request! Messed up JWT or State!');

    // Refresh the current users access token.
    // user.refresh().then((updatedUser) => {
    //   console.log(updatedUser !== user); //= > true
    //   console.log(updatedUser.accessToken);
    // });

    // Sign API requests on behalf of the current user.
    // user.sign({
    //   method: 'get',
    //   url: 'http://example.com',
    // });

    // We should store the token into a database.
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
