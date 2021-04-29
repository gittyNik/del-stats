import client from '../client';
import { WELCOME_MESSAGES } from '../config';

// eslint-disable-next-line import/prefer-default-export

export const sendMessage = ({ channelId, msg }) => client.channels.get(channelId).send(msg);

export const sendReact = ({ message, reaction }) => message.react(reaction);
export const deleteMessage = ({ message, reaction }) => message.delete(reaction);

export const welcomeMember = async ({ member, channelId }) => {
  const channel = await member.guild.channels.cache.get(channelId);
  if (!channel) throw new Error('Invalid Channel! welcomeMember');

  return channel.send(WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]);
};
