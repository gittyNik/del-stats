import { v4 as uuid } from 'uuid';
import { Cohort } from './cohort';
import { MockInterviewSlots } from './mock_interview_slots';
import { CohortBreakout } from './cohort_breakout';
import { changeTimezone } from './breakout_template';
import { LearnerBreakout } from './learner_breakout';

const WEEK_VALUES = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const createMockInterviewsForCohort_afterCapstone = ({ cohort_id, start_date }) => Cohort.findOne({
  where: {
    id: cohort_id,
  },
  raw: true,
})
  .then(cohort => ({ cohort_duration: cohort.cohort_duration, learners: cohort.learners }))
  .then(({ cohort_duration, learners }) => MockInterviewSlots
    .findAll({
      where: {
        cohort_duration: cohort_duration || 16,
      },
      raw: true,
    })
    .then(slots => ({
      // cohort_duration,
      learners,
      slots,
    })))
  .then(({ learners, slots }) => {
    let cohort_breakouts = [];
    let cohort_breakouts_2 = [];
    let learner_breakouts = [];
    let flag = false; // record when we get to week 0

    slots.map(slot => {
      let cb_uuid = uuid();
      if (slot.status === 'active') {
        let time_split = slot.time_scheduled.split(':');
        start_date = new Date(start_date);
        let time_scheduled = new Date(start_date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        time_scheduled.setDate(start_date.getDate() + (((
          WEEK_VALUES[slot.mock_interview_day.toLowerCase()]
            + 7 - start_date.getDay()) % 7)));

        time_scheduled.setHours(time_split[0], time_split[1], time_split[2]);
        time_scheduled = changeTimezone(time_scheduled, 'Asia/Kolkata');
        if (WEEK_VALUES[slot.mock_interview_day.toLowerCase()] === start_date.getDay()) {
          flag = true;
        }

        if (!flag) {
          cohort_breakouts_2.push({
            id: cb_uuid,
            type: 'mockinterview-aftercapstone',
            cohort_id,
            time_scheduled,
            duration: slot.mock_interview_duration,
            location: 'Online',
          });
        } else {
          cohort_breakouts.push({
            id: cb_uuid,
            type: 'mockinterview-aftercapstone',
            cohort_id,
            time_scheduled,
            duration: slot.mock_interview_duration,
            location: 'Online',
          });
        }
      }
    });

    cohort_breakouts = [...cohort_breakouts, ...cohort_breakouts_2];
    cohort_breakouts.splice(learners.length);
    learners.map((learner_id, index) => {
      learner_breakouts.push({
        id: uuid(),
        cohort_breakout_id: cohort_breakouts[index].id,
        learner_id,
      });
    });
    return CohortBreakout
      .bulkCreate(cohort_breakouts)
      .then(() => LearnerBreakout
        .bulkCreate(learner_breakouts));
  });

const getAllMockInterviews_afterCapstone = () => CohortBreakout.findAll({
  where: {
    type: 'mockinterview-aftercapstone',
  },
});

export {
  createMockInterviewsForCohort_afterCapstone,
  getAllMockInterviews_afterCapstone,
};
