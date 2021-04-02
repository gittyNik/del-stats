import { v4 as uuid } from 'uuid';
import { Cohort } from './cohort';
import MockInterviewSlots from './mock_interview_slots';
import { CohortBreakout } from './cohort_breakout';

const WEEK_VALUES = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const createMockInterviewsForCohort_afterCapstone = ({ cohort_id, start_date }) => {
  Cohort.findOne({
    where: {
      id: cohort_id,
    },
  })
    .then(cohort => ({ cohort_duration: cohort.cohort_duration, learners: cohort.learners }))
    .then(({ cohort_duration, learners }) => MockInterviewSlots
      .find({
        where: {
          cohort_duration,
        },
      })
      .then(slots => ({
        cohort_duration,
        learners,
        slots,
      })))
    .then(({ cohort_duration, learners, slots }) => {
      let cohort_breakouts = [];
      let learner_breakouts = [];
      let index = 0;
      while() {
        slot[index]
        start_date.getDay()
        
      }
      slots.map(slot => {
        let cb_uuid = uuid();

        let scheduled_time = new Date(assessmentDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        cohort_breakouts.push({
          id: cb_uuid,
          type: 'mockinterview-aftercapstone',
          cohort_id,
          time_scheduled: slot.time_scheduled,
          duration: slot.mock_interview_duration,
          location: 'Online',
        });
        // learner_breakouts.push({
        //   id: uuid(),

        // })
      });
    });
};

export {
  createMockInterviewsForCohort_afterCapstone,
};
