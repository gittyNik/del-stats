/* eslint-disable import/prefer-default-export */
import ytdl from 'ytdl-core-discord';
import _ from 'lodash';
import { findChannelByName } from './channel.controller';
import { SETUP_CHANNELS, VOICE_URLS } from '../config';
import { getGuild } from './guild.controller';
import { getBotUserId } from './user.controller';

export const focusForest = async (oldMember, newMember) => {
  const guild_id = process.env.DISCORD_TEP_GUILD_ID;
  const voiceChannel = await findChannelByName({ guild_id, channel_name: SETUP_CHANNELS[1].data.public[0].channels[3] });

  let newUserChannel = newMember.channelID;
  let oldUserChannel = oldMember.channelID;

  const play = async (connection) => connection.play(
    await ytdl(_.sample(VOICE_URLS)),
    { type: 'opus', highWaterMark: 50, volume: 0.7 },
  )
  // When the song is finished, play it again.
    .on('finish', play);

  const Guild = await getGuild({ guild_id }); // Getting the guild.
  const botUserId = await getBotUserId();
  const discordBotUser = Guild.members.cache.get(botUserId); // Getting the member.

  if (newUserChannel === voiceChannel.id) {
    // if a user joins the focus forest channel channel

    // if bot not in voice channel and users connected to the channel
    if (!discordBotUser.voice.channel && voiceChannel.members.size > 0) {
      // play music
      voiceChannel.join()
        .then(await play)
        .catch(console.error);
    }
  } else if (oldMember && oldMember.channel && oldMember.channel.members
    && !(oldMember.channel.members.size - 1) && oldUserChannel === voiceChannel.id) {
    setTimeout(() => { // if 1 (you), wait five minutes
      if (!(oldMember.channel.members.size - 1)) { // if there's still 1 member,
        oldMember.channel.leave();
      }
    }, 60000); // leave in 1 minute
  }
};
