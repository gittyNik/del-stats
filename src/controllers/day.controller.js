import Day from '../models/day';
import Cohort from '../models/cohort'
import User from "../models/user";
import createChunks from "../util/createChunks" 

export const getAll = (req, res) => {
  Day.find().exec()
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const dayDetails = async (req, res) => {
  const {dayNumber} = req.params
  let {cohortID} = req.query
  Day.find({day : dayNumber, cohort : cohortID})
  .populate({
    path:'timeline.prompt',
    populate: {path: 'pings'}
    })
  .populate('pingpongs.ping')
  .populate('pairs.students')
  .exec().then(day => {
    res.json({day})
  }).catch(e => res.status(500).send(e))
}

export const getOne = (req, res) => {
  Day.findById(req.params.day_id).exec()
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const create = (req, res) => {
  const {data} = req.body;
  new Day({data}).save()
  .then(data => res.status(201).json({data}))
  .catch(err => res.status(500).send(err));
}

export const update = (req, res) => {
  const {phase} = req.body;
  Day.findByIdAndUpdate(req.params.day_id, phase)
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const deleteOne = (req, res) => {
  Day.remove({id:req.params.id}).exec()
  .then(() => res.status(204))
  .catch(err => res.status(500).send(err));
}

export const getCohortDays = (req, res) => {
  Day.find({cohort:req.params.cohort_id})
    .populate({
      path:'timeline.prompt',
      populate: {path: 'pings'}
      })
    .populate('pingpongs.ping')
    .populate('pairs.students')
    .exec()
    .then(data => res.json({data}))
    .catch(err => res.status(500).send(err));
}

const todayFilter = () => {
  const today = new Date();
  const tonight = new Date();

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return { $gte: today, $lt: tonight };
}


export const getCurrentDays = (filter = {}) => {
  return Day.find({
    ...filter,
    date: todayFilter()
  }).exec();
}

export const getToday = async (req, res) => {
  try {
    const {_id: userId, currentCohort: cohort} = req.user;
    const date = todayFilter();
    const day = await Day.findOne({cohort, date})
    .populate('timeline.prompt')
    .populate('pingpongs.to')
    .populate('pingpongs.ping')
    .populate('pairs.students')
    .exec();
      // important: ObjectId is not string
    day.pingpongs = day.pingpongs.filter(pp => pp.by.equals(userId));
    day.timeline = day.timeline.map(tl => {
      let startTime = tl.startTime;
      startTime.setDate(day.date.getDate());
      startTime.setFullYear(day.date.getFullYear());
      startTime.setMonth(day.date.getMonth());
      return {
        _id: tl._id,
        prompt: tl.prompt,
        startTime
      }
    })
    res.send({data:day});
  } catch (err) {
    console.log("Day not found", err);
    res.sendStatus(404);
  }
}

export const createDayPairs = async (day) => { 

    let students = await User.find({
      'currentCohort': day.cohort
    }).exec()
    
    if(day.data.find(x=> x.type=="Milestone")) {
      // THIS LINE WAS COMMENTED BECAUE IT WAS RETURNING AN ARRAY WITH OBJECTIDs BUT NOT AN ARRAY OF OBJECTS(which is required)
      // students = students.map(s => s._id)
      let p = createChunks(students, 3)
       for (let i = 0; i < p.length; i++) {
         if (p[i].students.length <= 1) {
           p[i-1].students = p[i].students.concat(p[i - 1].students)
           p.pop()
         }
       }
       day.pairs = p
       return day 
    } else {

      // students = students.map(s => s._id)
      let p = createChunks(students, 2)  
      day.pairs = p
      // day.save()
      console.log("DAY PAIRS")
      return day
  }
}

const getPhase = i => {
  if(i<10) return 'Week 0';
  if(i<39) return 'Core';
  if(i<67) return 'Focus';
  if(i<81) return 'Deep Focus';
  if(i<95) return 'Capstone Product';
  return 'Career';
}

const createDays = (cohortId, cohortStartDate, fromDay, count) => {
  count = +count;
  let dayDate = new Date(cohortStartDate.getTime());
  let allDays =[];
  for (let i = fromDay; i < fromDay + count; i++) {

      let dDate=new Date(dayDate.getTime());
      dDate.setDate(dDate.getDate() + i);

      let ms = dDate.getTime();
      dDate.setHours(0)
      dDate.setMinutes(1)

      let day = new Day({
      day: i,
      date: dDate,
      cohort: cohortId,
      phase: getPhase(i),
      timeline:[],
    }).save()
    allDays.push(day)
  }

  return Promise.all(allDays)
}

export const createCohortDays = async (req, res) => {
  try {
    let [latestDay] = await Day.find({cohort : req.params.cohort_id}).sort({day : -1}).limit(1);
    let cohort = await Cohort.findOne({_id : req.params.cohort_id});
    let nextDay = latestDay === null ? 1 : (1 + latestDay.day);
    let days = await createDays(cohort._id, cohort.startDate, nextDay, req.body.count);
    res.send(days);
  } catch(err) {
    console.error(err);
    res.sendStatus(404);
  }

}

export const resetCohortDays = ({_id, startDate}) => {
  return createDays(_id, startDate, 1, 108);

}

export const addPromptToTimeline = (req, res) => {
  const {startTime, prompt} = req.body;
  const {day_id} = req.params;
  Day.update({_id: day_id}, {
    $push: {"timeline": {startTime, prompt}}
  })
  .then(data => {
    Day.findById({_id: day_id})
    .populate({
      path:'timeline.prompt',
      populate: {path: 'pings'}
    })
    .populate('pairs.students')
    .exec()
    .then( data => {
       res.json({data})
    }).catch(err => {
      console.log(err);
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).send(err)});
}

export const addContentToDay = (req, res) => {
  const data = req.body;
  const {day_id} = req.params;
  Day.update({_id: day_id}, {
    $set: {'data': data}
  })
  .then( data => {
    Day.findById({_id: day_id})
      .exec()
      .then(data => {
        res.json({data})
       })
      .catch(err => {
        console.log(err);
        })
    })
  .catch(err => {
    console.log(err)
    res.status(500).send(err)
  })
}

export const removePromptFromTimeline = (req, res) => {
  const {day_id, timeline_id} = req.params;
  Day.update(
    {'_id': day_id, 'timeline._id': timeline_id},
    { $pull: { 'timeline': {_id: timeline_id} }}
  )
  .then( data => {
    res.json({data})
  })
  .catch(err => {
    res.status(500).send(err)
  });
}

export const resetPairs = async (req, res) => {

  try {
    let day = await Day.findById(req.params.day_id)
    .populate('pairs.students')
    .exec();
    day = await createDayPairs(day);
    day.save();
    const data = day.pairs;
    res.send({data});
  } catch(err) {
    res.sendStatus(500);
  }

}

export const resetDay = async (req, res) => {
  const {replicate} = req.body;
  const day = await Day.findById(replicate);
  Day.findByIdAndUpdate(req.params.day_id, {$set : {
    timeline: day.timeline,
    phase: day.phase,
    data: day.data,
  }}, {new: true})
  .populate({
    path:'timeline.prompt',
    populate: {path: 'pings'}
  })
  .then(data => {
    res.send({data})
  }).catch(err => {
    res.sendStatus(500);
  });
}
