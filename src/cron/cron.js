import User from '../models/user';
import Prompt from '../models/prompt';
import dbConnect from '../util/dbConnect';

import { createDayPairs, getCurrentDays } from '../controllers/day.controller';
import { populateCurrentCohorts } from '../controllers/cohort.controller';
import { populatePingpongs } from '../controllers/pingpong.controller';
import { getStudentPair } from '../util/getPair';
import * as cron from 'cron';

const CronJob = cron.CronJob;


const populateCurrentDays = () => getCurrentDays()
  .then((days) => {
    const ps = [];
    for (let i = 0; i < days.length; i++) {
      ps.push(createDayPairs(days[i])
        .then(day => populatePingpongs(days[i])
          .then(day => day.save())));
    }
    return Promise.all(ps);
  })
  .catch(e => console.log(`Errored out in populateCurrentDays ${e}`));


dbConnect().then(async (c) => {
  await populateCurrentDays();
  await populateCurrentCohorts();
  console.log('Starting cron Job');
  c.connection.close();
}).catch(console.log);


// job()
