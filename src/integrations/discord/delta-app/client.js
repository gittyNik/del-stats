import ClientOAuth2 from 'client-oauth2';
import { config } from './config';

// eslint-disable-next-line import/prefer-default-export
export const discordAuth = new ClientOAuth2(config());
