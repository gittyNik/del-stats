/* eslint-disable import/prefer-default-export */
import ytdl from 'ytdl-core-discord';
import _ from 'lodash';
import { findChannelByName } from './channel.controller';
import { SETUP_CHANNELS, VOICE_URLS } from '../config';

export const focusForest = async (oldMember, newMember) => {
  const guild_id = process.env.DISCORD_TEP_GUILD_ID;
  const voiceChannel = await findChannelByName({ guild_id, channel_name: SETUP_CHANNELS[1].data.public[0].channels[3] });

  let newUserChannel = newMember.channelID;
  let oldUserChannel = oldMember.channelID;

  if (newUserChannel === voiceChannel.id && !(newMember.channel.members.size - 1)) {
    // first User Joins a voice channel.
    voiceChannel.join()
      .then(async connection => connection.play(await ytdl(_.sample(VOICE_URLS)), { type: 'opus' }))
      .catch(console.error);
  } else if (oldMember && oldMember.channel && oldMember.channel.members
    && !(oldMember.channel.members.size - 1) && oldUserChannel === voiceChannel.id) {
    setTimeout(() => { // if 1 (you), wait five minutes
      if (!(oldMember.channel.members.size - 1)) { // if there's still 1 member,
        oldMember.channel.leave();
      }
    }, 60000); // leave in 1 minute
  }
};
