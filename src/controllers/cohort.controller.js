import Cohort from '../models/cohort';
import {getCohortStudents} from '../controllers/student.controller';
import createChunks from "../util/createChunks";

export const getCohorts = (req, res) => {
  Cohort.findAll()
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const getCohortByName = (req, res) => {
  const {year, city, cohort_name} = req.params;

  Cohort.find({name : cohort_name, location : city})
  .then( cohorts => {
    cohorts.map( (cohort, i) => {
      let date = cohort.startDate;
      if (date.getFullYear().toString()===year){
        getCohortStudents(cohort)
        .then(students => {
           cohort.students = students;
          res.json({cohort})
        })
      }
    })
  }).catch(e => res.status(500).send(e))

}

export const getCohort = (req, res) => {
  Resource.findById(req.params.id).lean().exec()
  .then(cohort => {
    getCohortStudents(cohort)
    .then(students => {
      cohort.students = students;
      res.json({cohort: cohort})
    })
  })
  .catch(err => res.status(500).send(err));
}

export const createCohort = (req, res) => {
  let {name, location, program, startDate, endDate} = req.body;
  startDate = new Date(+startDate)
  new Resource({name, location, program, startDate, endDate}).save()
  .then(data => {
    res.status(201).json({data});
  })
  .catch(err => res.status(500).send({err}));
}

export const updateCohort = (req, res) => {
  const {location, program, startDate} = req.body;
  Resource.findByIdAndUpdate(req.params.id, {location, program, startDate})
  .then(data => res.json({data}))
  .catch(err => res.status(500).send(err));
}

export const deleteCohort = (req, res) => {
  Resource.remove({id:req.params.id}).exec()
  .then(() => res.status(204))
  .catch(err => res.status(500).send(err));
}

export const createSpotters = (cohort) => {
  return getCohortStudents(cohort).then((students) => {
    students = students.map(s => s._id)
    let p = createChunks(students, 3)

    for (let i = 0; i < p.length; i++) {
      if (p[i].students.length <= 1) {
        p[i-1].students = p[i].students.concat(p[i - 1].students)
        p.pop()
      }
    }
    cohort.spotters = p
    return cohort.save()
    })
  }

export const populateCurrentCohorts = () =>{
  let today = new Date()
  let tonight = new Date()

  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)

  tonight.setHours(23)
  tonight.setMinutes(59)
  tonight.setSeconds(59)

  return Resource.find({
    'startDate': {
      '$gte': today,
      '$lt': tonight
    }
  })
  .then( cohorts => {//console.log(cohorts)
    console.log("PopulateCurrentCohort")
    let p =[]
    for (let i = 0; i < cohorts.length; i++) {
      p.push(createSpotters(cohorts[i]))
    }
    return Promise.all(p)
  })
  .catch(e => console.log("Errored out in populateCurrentCohorts" + e))

} 

export const resetSpotters = async (req, res) => {

  Resource.findById(req.params.cohort_id)
  .then(cohort => createSpotters(cohort))
  .then(cohort => {
    res.send(cohort);
  })
  .catch(err => {
    res.sendStatus(500);
  });

}

export const getUpcomingCohorts = (req, res) => {
  res.send("Lists of upcoming cohorts");
}
