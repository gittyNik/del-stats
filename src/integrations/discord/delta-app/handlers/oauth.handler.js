import jwt from 'jsonwebtoken';
import logger from '../../../../util/logger';
import { getUser, addDiscordSocialConnection, hasDiscordSocialConnection } from '../controllers/user.controller';
import { discordOAuth2, discordBotOAuth2 } from '../controllers/oauth.controller';
import { addGuildMember } from '../controllers/guild.controller';
import { addRoleToUser, findRole } from '../controllers/role.controller';
// import discordBot from '../client';
import { User, USER_ROLES } from '../../../../models/user';
import { getCohortFromLearnerId } from '../../../../models/cohort';
import { HttpBadRequest } from '../../../../util/errors';
import {
  createState, retrieveState, removeState, getCohortFormattedId,
} from '../utils';
import { botConfig, SETUP_ROLES } from '../config';

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

    if (!deltaUser) {
      await removeState({ key: stateKey });
      throw new HttpBadRequest('Bad Request! Messed up JWT! Couldn\'t find user in delta');
    }

    // get discord user token to do stuff on their behalf
    const authRes = await discordOAuth2({ state: stateKey }).code.getToken(req.originalUrl);
    const user = await getUser(authRes.accessToken);
    const guild_id = process.env.DISCORD_GUILD_ID;
    // await discordBot.guild.available({});

    if (stateData.prompt === 'none') {
      await removeState({ key: stateKey });

      // can remove this
      // const result = await addGuildMember({
      //   discord_user_access_token: authRes.accessToken,
      //   discord_bot_access_token: botConfig.token,
      //   user_id: user.data.id,
      //   guild_id,
      // });

      await addRoleToUser({ guild_id, role_name: SETUP_ROLES[0].name, user_id: user.id });

      return res.json({
        message: 'oauth success',
        type: 'success',
        data: {
          token: authRes.accessToken,
          user: user.data,
          deltaUser,
        },
      });
    }

    if (stateData.prompt === 'concent') {
      // user has first time clicked join
      await addDiscordSocialConnection(deltaUser, user);

      // @TO-DO detect which server(s) to add a user to, program type, soal admin
      // right now we will be using const guild id from env

      const result = await addGuildMember({
        discord_user_access_token: authRes.accessToken,
        discord_bot_access_token: botConfig.token,
        user_id: user.data.id,
        guild_id,
      });

      // give role by Bot

      const cohort = getCohortFromLearnerId(deltaJwtData.userId);
      const cohortChannelName = await getCohortFormattedId([{ cohort, program_type: cohort.program_id }]);

      const cohortRole = await findRole({ guild_id, name: cohortChannelName });

      if (deltaUser.roles.include(USER_ROLES.LEARNER)) {
        // assign cohort role, assign sailor role
        await addRoleToUser({ guild_id, role_name: cohortRole.name, user_id: user.id });
        await addRoleToUser({ guild_id, role_name: SETUP_ROLES[2].name, user_id: user.id });
      } else if (!deltaUser.roles.include([USER_ROLES.CAREER_SERVICES, USER_ROLES.RECRUITER,
        USER_ROLES.REVIEWER, USER_ROLES.GUEST, USER_ROLES.CATALYST])) {
        // assign captain role
        await addRoleToUser({ guild_id, role_name: SETUP_ROLES[0].name, user_id: user.id });
      } else {
        // assign pirate role
        await addRoleToUser({ guild_id, role_name: SETUP_ROLES[1].name, user_id: user.id });
      }

      await removeState({ key: stateKey });

      return res.json({
        message: 'oauth success',
        type: 'success',
        data: {
          result: result.data,
          token: authRes.accessToken,
          user: user.data,
          deltaUser,
        },
      });
    }

    await removeState({ key: stateKey });
    throw new HttpBadRequest('Bad Request! Messed up JWT or State!');
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
