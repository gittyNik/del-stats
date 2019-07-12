import {User, USER_ROLES} from '../models/user';

import Cohort from '../models/cohort';
import { getCohortByName } from '../controllers/cohort.controller';

/**
 * @api {get} /profile Get the profile
 * @apiHeader {String} authorization JWT Token.
 * @apiName GetProfile
 * @apiGroup Profile
 */
export const getProfile = (req, res) => {
  res.json({user: req.jwtData.user});
}

export const getSpotterTeam = student => new Promise(async (resolve, reject) =>{
  console.log(student);
  if(student.role !== USER_ROLES.STUDENT) {
    // Spotters are implemented only for students
    return resolve(null);
  }
  let cohort = await Cohort.findById(student.currentCohort).exec();
  let spotterTeam = cohort.spotters.find(team => {
    return team.students.some(s => student._id.equals(s));
  });
  if(spotterTeam == null) {
    return resolve(null);
  }
  spotterTeam.students = await User.find({_id: {$in: spotterTeam.students}}, 'name profile.github.avatar_url profile.phone').exec();
  resolve(spotterTeam);
});

export const populateCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.jwtData.user).lean().exec();
    user.spotterTeam = await getSpotterTeam(user);
    req.user = user;
    next();
  } catch (err) {
    res.sendStatus(404);
  }
}


export const updateUser = (req, res) => {
  const {id, newCohort, year, city} = req.query
  let cohortID
  User.findOne({_id : id}).lean().then( async (user) => {

    await Cohort.find({name : newCohort, location : city}).lean().exec().then( cohorts => {
      cohorts.map( (cohort, i) => {
        let date = cohort.startDate;
        if (date.getFullYear().toString()===year){
          cohortID = cohort._id
        }
      })
    })
    console.log (`-----`, cohortID)
    user.currentCohort = cohortID
    user.cohorts.push(cohortID)
    User.findByIdAndUpdate(id, {$set : {cohorts: user.cohorts, currentCohort : user.currentCohort}}).then(() => res.send()).catch(e => res.sendStatus(500).send(e))
    
  }).catch(e => res.sendStatus(500).send(e))
}
