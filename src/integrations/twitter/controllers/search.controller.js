import { client } from './twitter.auth.controller';

export const getUserTweets = handle => client.get('search/tweets.json', { q: handle, count: 15 });
