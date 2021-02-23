import logger from '../src/util/logger';

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/portal');

const {
  User,
  Cohort,
  Prompt,
  Ping,
  Day,
} = require('../server/models');

let db = mongoose.connection;

db.on('error', err => {
  logger.info('connection error', err);
});
db.once('open', () => {
  logger.info('connected.');
});

// get all users from current cohort name = Small Frozen Chair
// User.find({currentCohort: '5aca10f6afd0cc485412a0d9'}).populate('currentCohort').exec((err, data) => {
//     logger.info("USERS FROM COHORT 'SMALL FROZEN CHAIR': ");
//     data.forEach( user => {
//         logger.info("------------------------------");
//         logger.info(user.name + ": "+ user.currentCohort.name);
//     });
// });

// get all users from current cohort name = Small Frozen Chair and path = frontend
// add path of the student in the database before running this
// User.find({currentCohort: '5aca10f6afd0cc485412a0d9', path: 'frontend'}).populate('currentCohort').exec((err, data) => {
//     logger.info("USERS FROM COHORT 'SMALL FROZEN CHAIR' AND PATH IS FRONTEND ");
//     data.forEach( user => {
//         logger.info("------------------------------");
//         logger.info(user.name + ": "+ user.currentCohort.name);
//         logger.info("Path: "+user.path);
//     });
// });

// get accountability of "Destinee Terry from cohort = Small Frozen Chair"
// Cohort.findOne({name: 'Small Frozen Chair'}).populate('spotters.students').exec((err, cohort) => {
//     logger.info("\nSPOTTERS FOR COHORT 'Small Frozen Chair' \n");
//     cohort.spotters.forEach( spotter => {
//         if(spotter.students[0].name == "Destinee Terry") {
//             logger.info("Spotters team name: "+spotter.teamName);
//             logger.info("Accountability buddy of 'Destiny Terry is: "+spotter.students[1].name);
//             logger.info("---------------------------------");
//         }
//         else if(spotter.students[1].name == "Destinee Terry") {
//             logger.info("Spotters team name: "+spotter.teamName);
//             logger.info("Accountability buddy of 'Destiny Terry is ': "+spotter.students[0].name);
//             logger.info("---------------------------------");
//         }

//     })
// })

// get all spotters for current cohort
// Cohort.findOne({name: 'Small Frozen Chair'}).populate('spotters.students').exec((err, cohort) => {
//     logger.info("\nSPOTTERS FOR COHORT 'Small Frozen Chair' \n");
//     cohort.spotters.forEach( spotter => {
//         logger.info("Spotters team name: "+spotter.teamName);
//         logger.info("Student 1: "+spotter.students[0].name);
//         logger.info("Student 2: "+spotter.students[1].name);
//         logger.info("---------------------------------");
//     })
// })

// get all pairs where day = 56
// Day.findOne({day: 56}).populate('pairs.students').exec( (err, day) => {
//     var pairs = day.pairs;
//     pairs.forEach( pair => {
//         logger.info("--------------------------------");
//         logger.info("Team Name: "+pair.teamName);
//         logger.info("Student 1: "+pair.students[0].name);
//         logger.info("Student 2: "+pair.students[1].name);
//         logger.info("--------------------------------");
//     })
// })

// get intentions of all students at day-56
// Day.findOne({day: 56},'timeline').populate('timeline.prompt').populate('timeline.pingpongs.ping').populate('timeline.pingpongs.by').populate('timeline.pingpongs.to').exec( (err, day) => {
//     logger.info("---------------------------------------------")
//     logger.info("INTENTIONS OF ALL STUDENTS AT DAY 56 \n")
//     day.timeline.forEach( timeline => {
//         timeline.pingpongs.forEach( pingpong => {
//             if(pingpong.ping.type == "Intention"){
//                 logger.info("Prompt type: "+timeline.prompt.type);
//                 logger.info(pingpong.ping.type+": "+pingpong.ping.data);
//                 logger.info("By: "+ pingpong.by.name);
//                 //logger.info("To: "+pingpong.to.name);
//                 logger.info("-----------------------------------");
//             }

//         })
//     })
// })

// get all feedback given to student = Aron Jacobs on day = 16
// Day.findOne({day: 16},'timeline').populate('timeline.prompt').populate('timeline.pingpongs.ping').populate('timeline.pingpongs.by').populate('timeline.pingpongs.to').exec((err, day) => {
//     logger.info("---------------------------------------------")
//     logger.info("FEEDBACK OF Aron Jacobs ON DAY 16 \n")
//     day.timeline.forEach( timeline => {
//         timeline.pingpongs.forEach( pingpong => {
//             if(pingpong.ping.type == "Feedback" && pingpong.to.name == "Aron Jacobs"){
//                 logger.info("Prompt type: "+timeline.prompt.type);
//                 logger.info(pingpong.ping.type+": "+pingpong.ping.data);
//                 logger.info("By: "+ pingpong.by.name);
//                 logger.info("To: "+pingpong.to.name);
//                 logger.info("-----------------------------------");
//             }

//         })
//     })
// })

// get feedback of "Keara Hansen" of all days
// Day.find({}).populate('timeline.prompt').populate('timeline.pingpongs.ping').populate('timeline.pingpongs.by').populate('timeline.pingpongs.to').exec((err, days) => {
//     //logger.info(day);
//     logger.info("---------------------------------------------")
//     logger.info("FEEDBACK OF Keara Hansen FOR ALL DAYS \n")
//     days.forEach((day) => {
//         day.timeline.forEach( timeline => {
//             timeline.pingpongs.forEach( pingpong => {
//                 if(pingpong.ping.type == "Feedback" && pingpong.to.name == "Keara Hansen"){
//                     logger.info("Prompt type: "+timeline.prompt.type);
//                     logger.info(pingpong.ping.type+": "+pingpong.ping.data);
//                     logger.info("By: "+ pingpong.by.name);
//                     logger.info("To: "+pingpong.to.name);
//                     logger.info("On day: "+day.day);
//                     logger.info("-----------------------------------");
//                 }

//             })
//         })
//     })
// })

// All questions submitted by "Keara Hansen" on Day = ?
Day.findOne({ day: '16' }, 'timeline').populate('timeline.prompt').populate('timeline.pingpongs.ping').populate('timeline.pingpongs.by')
  .populate('timeline.pingpongs.to')
  .exec((err, day) => {
    logger.info('-------------------------------');
    logger.info("QUESTIONS SUBMITTED BY Keara Hansen' ON DAY 27");
    day.timeline.forEach(timeline => {
      timeline.pingpongs.forEach(pingpong => {
        if (pingpong.ping.type == 'Question' && pingpong.by.name == 'Keara Hansen') {
          logger.info('----------------------------');
          logger.info(`Prompt type: ${timeline.prompt.type}`);
          logger.info(`${pingpong.ping.type}: ${pingpong.ping.data}`);
          logger.info(`Answer: ${pingpong.pong}`);
          logger.info(`By: ${pingpong.by.name}`);
        }
      });
    });
  });
