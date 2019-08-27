import mongoose from 'mongoose';
import Day from '../models/day';
import User from '../models/user';
import Prompt from '../models/prompt';
import { getIntentionPing } from '../models/ping';

export const addPong = (req, res) => {
  const { pong } = req.body;
  const { pingpong_id } = req.params;

  // Day.findOneAndUpdate to return updated day object
  // Day.update if you don't need day
  Day.findOneAndUpdate(
    { 'pingpongs._id': pingpong_id },
    { $set: { 'pingpongs.$.pong': pong } },
  ).then((data) => {
    if (data === null) {
      res.status(404).send('Pingpong not found!');
    } else {
      res.json({ data });
    }
  }).catch((err) => {
    res.sendStatus(500);
  });
};

const createPingPong = (ping, user, day, triggerTime) => {
  const pingpong = {
    triggerTime,
    ping,
    by: user,
  };
  switch (ping.type) {
    case 'Pair':
      pingpong.to = getStudentPair(day, user);
    case 'Intention':
    case 'Content':
    case 'Self':
    case 'Cohort':
    case 'Peers':
    default:
      return pingpong;
  }
};


export const populatePingpongs = async (day) => {
  const users = await User.find({
    currentCohort: day.cohort,
  });

  // get all prompts from day timeline
  // for all prompt

  const { timeline, pingpongs } = day;

  const intentionPing = await getIntentionPing();
  day.pingpongs = users.map(user => createPingPong(intentionPing, user, day));

  for (let i = 0; i < timeline.length; i++) {
    let { prompt, startTime } = timeline[i];
    startTime.setDate(day.date.getDate());
    startTime.setFullYear(day.date.getFullYear());
    startTime.setMonth(day.date.getMonth());
    console.log(`Prompt${prompt}`);

    prompt = await Prompt.findById(prompt);
    const { pings } = prompt;
    console.log(`PINGS${pings}`);

    for (let k = 0; k < pings.length; k++) {
      const ping = pings[k];
      console.log(ping);

      const triggerTime = new Date(startTime.valueOf() + prompt.duration * 60 * 1000);

      day.pingpongs = users.map(user => createPingPong(ping, user, day, triggerTime)).concat(day.pingpongs);
      // console.log(pingpongs)
    }
  }

  console.log('PING POPULATE:');
  return day;
};


export const resetPingpongs = async (req, res) => {
  try {
    let day = await Day.findById(req.params.day_id);
    day = await populatePingpongs(day);
    day.save();
    const data = day.pingpongs;
    res.send({ data });
  } catch (err) {
    res.sendStatus(500);
  }
};
