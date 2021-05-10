import ClientOAuth2 from 'client-oauth2';
import jwt from 'jsonwebtoken';
import { OAUTH_SCOPES } from '../config/constants';
import {
  oAuthConfig, OAuthRedirects, botConfig, SETUP_ROLES, PROGRAM_NAMES,
} from '../config';
import { addGuildMember } from './guild.controller';
import { addRoleToUser, findRole } from './role.controller';
import { getUser, addDiscordSocialConnection } from './user.controller';
import {
  retrieveState, removeState, getCohortFormattedId,
} from '../utils';

// import discordBot from '../client';
import { User, USER_ROLES } from '../../../../models/user';
import { Cohort, getCohortIdFromLearnerId } from '../../../../models/cohort';
import { HttpBadRequest } from '../../../../util/errors';

export const discordOAuth2 = ({ state, prompt = 'consent' }) => new ClientOAuth2(oAuthConfig({
  scopes: [OAUTH_SCOPES.EMAIL, OAUTH_SCOPES.IDENTIFY, OAUTH_SCOPES.CONNECTIONS, OAUTH_SCOPES.GUILDS_JOIN],
  redirectUri: OAuthRedirects.discordOAuth2,
  state,
  query: {
    prompt,
  },
}));

export const discordBotOAuth2 = ({ state, prompt = 'consent' }) => new ClientOAuth2(oAuthConfig({
  scopes: [OAUTH_SCOPES.BOT],
  redirectUri: OAuthRedirects.discordBotOAuth2,
  state,
  query: {
    prompt,
    permissions: 8,
  },
}));

export const oauthRedirect = async ({ stateKey, originalUrl }) => {
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
  const authRes = await discordOAuth2({ state: stateKey }).code.getToken(originalUrl);
  const user = await getUser(authRes.accessToken);

  // @TO-DO detect which server(s) to add a user to, program type, soal admin
  // right now we will be using const guild id from env
  const guild_id = process.env.DISCORD_TEP_GUILD_ID;

  if (stateData.prompt === 'none') {
    await removeState({ key: stateKey });

    return {
      message: 'oauth success',
      type: 'success',
      data: {
        token: authRes.accessToken,
        user,
        deltaUser,
      },
    };
  }

  if (stateData.prompt === 'consent') {
    // user has first time clicked join
    await addDiscordSocialConnection(deltaUser.id, user, authRes);

    const result = await addGuildMember({
      discord_user_access_token: authRes.accessToken,
      discord_bot_access_token: botConfig.token,
      user_id: user.id,
      guild_id,
    });

    // give role by Bot

    if (deltaUser.roles.includes(USER_ROLES.LEARNER)) {
      // assign cohort role, assign sailor role
      const cohortId = await getCohortIdFromLearnerId(deltaUser.id);
      const cohort = Cohort.findOne({
        where: {
          id: cohortId,
        },
      },
      { raw: true });
      const cohortChannelName = getCohortFormattedId([{ cohort, program_type: cohort.program_id }]);

      const cohortRole = await findRole({ guild_id, name: cohortChannelName });
      const programRole = await findRole({ guild_id, name: PROGRAM_NAMES.find(nm => nm.id === cohort.program_id).name });

      await addRoleToUser({ guild_id, role_name: cohortRole.name, user_id: user.id });
      await addRoleToUser({ guild_id, role_name: cohortRole.name, user_id: user.id });
      await addRoleToUser({ guild_id, role_name: programRole.name, user_id: user.id });
    } else if (!deltaUser.roles.some(us => [USER_ROLES.CAREER_SERVICES, USER_ROLES.RECRUITER,
      USER_ROLES.REVIEWER, USER_ROLES.GUEST, USER_ROLES.CATALYST].includes(us))) {
      // assign captain role
      await addRoleToUser({ guild_id, role_name: SETUP_ROLES[0].name, user_id: user.id });
    } else {
      // assign pirate role, assign program role
      // @TO-DO associate catalysts and educators with their program role
      // const programRole = await findRole({ guild_id, name: PROGRAM_NAMES.find(nm => nm.id === cohort.program_id).name });
      // await addRoleToUser({ guild_id, role_name: programRole.name, user_id: user.id });
      await addRoleToUser({ guild_id, role_name: SETUP_ROLES[1].name, user_id: user.id });
    }

    await removeState({ key: stateKey });

    return {
      message: 'oauth success',
      type: 'success',
      data: {
        result: result.data,
        token: authRes.accessToken,
        user,
        deltaUser,
      },
    };
  }

  await removeState({ key: stateKey });
  throw new HttpBadRequest('Bad Request! Messed up State!');
};
