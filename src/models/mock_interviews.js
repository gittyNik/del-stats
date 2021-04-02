import { v4 as uuid } from 'uuid';
import { Cohort } from './cohort';
import MockInterviewSlots from './mock_interview_slots';
import { CohortBreakout } from './cohort_breakout';
import { changeTimezone } from './breakout_template';

const WEEK_VALUES = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

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
      
      

      start_date = new Date(start_date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      slots.map(slot => {
        let cb_uuid = uuid();
        if (slot.status === 'active') {
          let time_split = slot.time_scheduled.split(':');
          let time_scheduled = new Date(start_date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
          
          time_scheduled.setDate(start_date.getDate() + (((
            WEEK_VALUES[slot.mock_interview_day.toLowerCase()]
            + 7 - start_date.getDay()) % 7)));
        
          time_scheduled.setHours(time_split[0], time_split[1], time_split[2]);
        
          time_scheduled = changeTimezone(time_scheduled, 'Asia/Kolkata');

          cohort_breakouts.push({
            id: cb_uuid,
            type: 'mockinterview-aftercapstone',
            cohort_id,
            time_scheduled: slot.time_scheduled,
            duration: slot.mock_interview_duration,
            location: 'Online',
          });  
        }
        
        // learner_breakouts.push({
        //   id: uuid(),

        // })
      });
    });
};

export {
  createMockInterviewsForCohort_afterCapstone,
};
