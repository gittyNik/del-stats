
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/portal');

const {
    User,
    Cohort,
    Prompt,
    Ping,
    Day
  } = require('../server/models')
 
var db = mongoose.connection;
 
db.on('error', err => {
console.log('connection error', err);
});
db.once('open', () =>  {
console.log('connected.');
});

// get all users from current cohort name = Small Frozen Chair
// User.find({currentCohort: '5aca10f6afd0cc485412a0d9'}).populate('currentCohort').exec((err, data) => {
//     console.log("USERS FROM COHORT 'SMALL FROZEN CHAIR': ");
//     data.forEach( user => {
//         console.log("------------------------------");
//         console.log(user.name + ": "+ user.currentCohort.name);
//     });
// });

// get all users from current cohort name = Small Frozen Chair and path = frontend
// add path of the student in the database before running this
// User.find({currentCohort: '5aca10f6afd0cc485412a0d9', path: 'frontend'}).populate('currentCohort').exec((err, data) => {
//     console.log("USERS FROM COHORT 'SMALL FROZEN CHAIR' AND PATH IS FRONTEND ");
//     data.forEach( user => {
//         console.log("------------------------------");
//         console.log(user.name + ": "+ user.currentCohort.name);
//         console.log("Path: "+user.path);
//     });
// });

// get accountability of "Destinee Terry from cohort = Small Frozen Chair"
// Cohort.findOne({name: 'Small Frozen Chair'}).populate('spotters.students').exec((err, cohort) => {
//     console.log("\nSPOTTERS FOR COHORT 'Small Frozen Chair' \n");
//     cohort.spotters.forEach( spotter => {
//         if(spotter.students[0].name == "Destinee Terry") {
//             console.log("Spotters team name: "+spotter.teamName);
//             console.log("Accountability buddy of 'Destiny Terry is: "+spotter.students[1].name);
//             console.log("---------------------------------");
//         }
//         else if(spotter.students[1].name == "Destinee Terry") {
//             console.log("Spotters team name: "+spotter.teamName);
//             console.log("Accountability buddy of 'Destiny Terry is ': "+spotter.students[0].name);
//             console.log("---------------------------------");
//         }
        
//     })
// })

// get all spotters for current cohort
// Cohort.findOne({name: 'Small Frozen Chair'}).populate('spotters.students').exec((err, cohort) => {
//     console.log("\nSPOTTERS FOR COHORT 'Small Frozen Chair' \n");
//     cohort.spotters.forEach( spotter => {
//         console.log("Spotters team name: "+spotter.teamName);
//         console.log("Student 1: "+spotter.students[0].name);
//         console.log("Student 2: "+spotter.students[1].name);
//         console.log("---------------------------------");    
//     })
// })

// get all pairs where day = 56
// Day.findOne({day: 56}).populate('pairs.students').exec( (err, day) => {
//     var pairs = day.pairs;
//     pairs.forEach( pair => {
//         console.log("--------------------------------");
//         console.log("Team Name: "+pair.teamName);
//         console.log("Student 1: "+pair.students[0].name);
//         console.log("Student 2: "+pair.students[1].name);
//         console.log("--------------------------------");
//     })
// })


// get intentions of all students at day-56
// Day.findOne({day: 56},'timeline').populate('timeline.prompt').populate('timeline.pingpongs.ping').populate('timeline.pingpongs.by').populate('timeline.pingpongs.to').exec( (err, day) => {
//     console.log("---------------------------------------------")
//     console.log("INTENTIONS OF ALL STUDENTS AT DAY 56 \n")
//     day.timeline.forEach( timeline => {
//         timeline.pingpongs.forEach( pingpong => {
//             if(pingpong.ping.type == "Intention"){
//                 console.log("Prompt type: "+timeline.prompt.type);
//                 console.log(pingpong.ping.type+": "+pingpong.ping.data);
//                 console.log("By: "+ pingpong.by.name);
//                 //console.log("To: "+pingpong.to.name);
//                 console.log("-----------------------------------");
//             }
                
//         })
//     })
// })

// get all feedback given to student = Aron Jacobs on day = 16
// Day.findOne({day: 16},'timeline').populate('timeline.prompt').populate('timeline.pingpongs.ping').populate('timeline.pingpongs.by').populate('timeline.pingpongs.to').exec((err, day) => {
//     console.log("---------------------------------------------")
//     console.log("FEEDBACK OF Aron Jacobs ON DAY 16 \n")
//     day.timeline.forEach( timeline => {
//         timeline.pingpongs.forEach( pingpong => {
//             if(pingpong.ping.type == "Feedback" && pingpong.to.name == "Aron Jacobs"){
//                 console.log("Prompt type: "+timeline.prompt.type);
//                 console.log(pingpong.ping.type+": "+pingpong.ping.data);
//                 console.log("By: "+ pingpong.by.name);
//                 console.log("To: "+pingpong.to.name);
//                 console.log("-----------------------------------");
//             }
                
//         })
//     })
// })

// get feedback of "Keara Hansen" of all days
// Day.find({}).populate('timeline.prompt').populate('timeline.pingpongs.ping').populate('timeline.pingpongs.by').populate('timeline.pingpongs.to').exec((err, days) => {
//     //console.log(day);
//     console.log("---------------------------------------------")
//     console.log("FEEDBACK OF Keara Hansen FOR ALL DAYS \n")
//     days.forEach((day) => {
//         day.timeline.forEach( timeline => {
//             timeline.pingpongs.forEach( pingpong => {
//                 if(pingpong.ping.type == "Feedback" && pingpong.to.name == "Keara Hansen"){
//                     console.log("Prompt type: "+timeline.prompt.type);
//                     console.log(pingpong.ping.type+": "+pingpong.ping.data);
//                     console.log("By: "+ pingpong.by.name);
//                     console.log("To: "+pingpong.to.name);
//                     console.log("On day: "+day.day);
//                     console.log("-----------------------------------");
//                 }
                    
//             })
//         })
//     })
// })

// All questions submitted by "Keara Hansen" on Day = ?
Day.findOne({'day': '16'}, 'timeline').populate('timeline.prompt').populate('timeline.pingpongs.ping').populate('timeline.pingpongs.by').populate('timeline.pingpongs.to').exec((err, day) => {
    console.log("-------------------------------");
    console.log("QUESTIONS SUBMITTED BY Keara Hansen' ON DAY 27")
    day.timeline.forEach( timeline => {
        timeline.pingpongs.forEach( pingpong => {
            if(pingpong.ping.type == 'Question' && pingpong.by.name == 'Keara Hansen') {
                console.log("----------------------------");
                console.log("Prompt type: "+ timeline.prompt.type);
                console.log(pingpong.ping.type+": "+pingpong.ping.data);
                console.log("Answer: "+pingpong.pong);
                console.log("By: "+ pingpong.by.name);
            }
        })
    })
})
