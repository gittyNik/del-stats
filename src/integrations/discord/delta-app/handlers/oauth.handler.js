import logger from '../../../../util/logger';
import { getUserInfo, addDiscordSocialConnection, hasDiscordSocialConnection } from '../controllers/user.controller';
import { discordOAuth2 } from '../client';
import { User } from '../../../../models/user';
import { HttpBadRequest } from '../../../../util/errors';

export const joinDiscord = (req, res) => {
  const { id } = req.jwtData.user;

  // check if already has a social connection to discordF
  if (hasDiscordSocialConnection({ user_id: id })) {
    // @To-do redirect with prompt disabled
    let uri = discordOAuth2.code.getUri();
    return res.redirect(uri);
  }
  let uri = discordOAuth2.code.getUri();
  return res.redirect(uri);
};

const oauthRedirect = async (req, res) => {
  try {
    const authRes = await discordOAuth2.code.getToken(req.originalUrl);

    const user = await getUserInfo(authRes.accessToken);
    const deltaUser = await User.findOne(
      {
        where: {
          email: user.email,
        },
      },
      { raw: true },
    );

    if (deltaUser === null) {
      throw HttpBadRequest('User does not exist in delta!, try login with your Email on delta');
    }

    if (!hasDiscordSocialConnection({ email: user.email })) {
      return res.json({ data: 'Already has discord connection' });
    }

    const socialConnection = await addDiscordSocialConnection(deltaUser, user);

    // console.log(user.data); //= > { accessToken: '...', tokenType: 'bearer', ... }

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
    return res.json({
      text: 'Social Connection',
      data: socialConnection,
    });
  } catch (error) {
    // NOTE: An unauthorized token will not throw an error;
    // it will return a 401 Unauthorized response in the try block above

    logger.error(error);
    return res.sendStatus(500);
  }
};

export const oauthBotRedirect = async (req, res) => {
  // redirect to bot added successfully page
  res.json({ data: 'Bot added to server successfully!' });
};

export default oauthRedirect;
