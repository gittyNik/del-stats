import Cohort from '../models/cohort';
import Day from '../models/day';
import Prompt from '../models/prompt';
import faker from 'faker';
import _ from 'lodash';

import createTeams from '../util/createTeams';
import {createStudent} from './users';

export const createCohort = () => new Cohort({
  startDate: faker.date.between('2018-03-01', '2018-05-01'),
  endDate: faker.date.future(),
  name: faker.commerce.productName()
}).save()


const getPhase = day => (day > 20 ? (day > 45 ? "Deep Focus" : " Focus") : "Core");

// todo: calculate date from cohort
const createDay = async ({cohort, students, day}) => {

  const phase = getPhase(day);
  let date = new Date(cohort.startDate.valueOf());
  date.setDate(cohort.startDate.getDate() + day - 1);

  // let pairs = createTeams(students, 2);

  // get a list of prompts and populate them with their pings
  let prompts = await Prompt.aggregate([{
    $sample: {
      size: 3
    }
  }]);

  let pingpongs = [];
  let timeline = prompts.map(prompt => {

    let startTime = new Date(date.valueOf());
    startTime.setSeconds(0);
    startTime.setMinutes(45);
    startTime.setHours(11);

    // let triggerTime = new Date(startTime.valueOf() + prompt.duration);
    // for(let student of students) {
    //   for(let ping of prompt.pings) {
    //     pingpongs.push({
    //       triggerTime,
    //       ping,
    //       by: student,
    //       to: _.sample(students),
    //     });
    //   }
    // }

    return {
      prompt: prompt._id,
      startTime
    }
  });

  return new Day({cohort: cohort._id, day, phase, date, timeline}).save();

}

// todo: this logic needs to be associated with Cohort model itself
export const populateCohort = async ({cohort, studentCount, dayCount}) => {
  let students = [];
  for (let i = 0; i < studentCount; i++) {
    let student = await createStudent(cohort._id);
    students.push(student);
  }
  // cohort.spotters = createTeams(students, 2);
  let queries = [cohort.save()];
  for (var day = 1; day < dayCount; day++) {
    queries.push(createDay({cohort, students, day}));
  }
  return Promise.all(queries);
}
