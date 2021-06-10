import { v4 as uuid } from 'uuid';
import { Cohort } from './cohort';
import { MockInterviewSlots } from './mock_interview_slots';
import { CohortBreakout } from './cohort_breakout';
import { BreakoutTemplate } from './breakout_template';
import { LearnerBreakout } from './learner_breakout';
import { createBreakoutAppliedCatalystRelation } from './cohort_breakout_applied_catalysts';
import { Topic } from './topic';
import { Milestone } from './milestone';
import { populateTopics } from '../controllers/learning/breakout.controller';
import { Rubrics } from './rubrics';
import { User } from './user';
import { changeTimezone } from '../util/date-handlers';

const WEEK_VALUES = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

export const createMockInterviewsForCohort_afterCapstone = ({
  cohort_id, start_date, learners_exclude, program,
}) => Cohort.findOne({
  where: {
    id: cohort_id,
  },
  raw: true,
})
  .then(cohort => ({ cohort_duration: cohort.cohort_duration, learners: cohort.learners }))
  .then(({ cohort_duration, learners }) => MockInterviewSlots
    .findAll({
      where: {
        program,
        cohort_duration: cohort_duration || 16,
      },
      raw: true,
    })
    .then(slots => ({
      // cohort_duration,
      learners,
      slots,
    })))
  .then(({ learners, slots }) => Promise.all(learners.map(learner_id => User.findOne({
    where: {
      id: learner_id,
    },
    attributes: ['id', 'name'],
    raw: true,
  })))
    .then(data => ({ learners: data, slots })))
  .then(({ learners, slots }) => Topic.findOne({
    where: {
      title: 'Mock Interviews',
      description: 'Mock Interviews After Capstone',
    },
    attributes: ['id'],
    raw: true,
  })
    .then(topic => ({ learners, slots, topic_id: topic.id })))
  .then(({ learners, slots, topic_id }) => {
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
            topic_id,
            duration: slot.mock_interview_duration,
            location: 'Online',
          });
        } else {
          cohort_breakouts.push({
            id: cb_uuid,
            type: 'mockinterview-aftercapstone',
            cohort_id,
            time_scheduled,
            topic_id,
            duration: slot.mock_interview_duration,
            location: 'Online',
          });
        }
      }
    });

    cohort_breakouts = [...cohort_breakouts, ...cohort_breakouts_2];
    if (learners_exclude) {
      learners = learners.filter(learner => !learners_exclude.includes(learner.id));
    }
    cohort_breakouts.splice(learners.length);
    learners.map((learner, index) => {
      learner_breakouts.push({
        id: uuid(),
        cohort_breakout_id: cohort_breakouts[index].id,
        learner_id: learner.id,

      });
      cohort_breakouts[index].details = {
        learner_id: learner.id,
        learner_name: learner.name,
      };
    });
    return CohortBreakout
      .bulkCreate(cohort_breakouts)
      .then(() => LearnerBreakout
        .bulkCreate(learner_breakouts));
  });

export const createMockInterviewsForMultipleCohort_afterCapstone = ({
  cohorts,
  start_date,
  learners_exclude = null,
  program,
}) => Promise.all(cohorts.map(cohort_id => createMockInterviewsForCohort_afterCapstone({
  cohort_id, start_date, learners_exclude, program,
})));

export const getAllMockInterviews_afterCapstone = () => CohortBreakout.findAll({
  where: {
    type: 'mockinterview-aftercapstone',
  },
});

export const getAppliedCatalystDetailsByStatus = ({
  status,
}) => CohortBreakout
  .findAll({
    where: {
      catalyst_request_status: status,
    },
    include: [
      {
        model: User,
        attributes: ['name', 'role'],
        as: 'catalyst',
      },
      {
        model: User,
        attributes: ['id', 'name', 'email'],
        as: 'RequestedByCatalysts',
        through: {
          attributes: ['created_at'],
        },
      },
      Cohort,
      BreakoutTemplate,
      {
        model: Topic,
        attributes: [],
        include: [Milestone],
      },
    ],
    raw: true,
  })
  .then(populateTopics)
  .then(data => {
    data = data.map(bundle => {
      bundle['RequestedByCatalysts.created_at'] = bundle['RequestedByCatalysts.cohort_breakout_applied_catalysts.created_'];
      delete bundle['RequestedByCatalysts.cohort_breakout_applied_catalysts.created_'];
      delete bundle['RequestedByCatalysts.cohort_breakout_applied_catalysts.id'];
      return bundle;
    });
    return data;
  });

export const createRequestForCatalyst = ({ cohort_breakout_id, catalyst_id }) => {
  let request_id = uuid();
  return createBreakoutAppliedCatalystRelation({
    id: request_id, cohort_breakout_id, applied_catalyst_id: catalyst_id,
  })
    .then(() => CohortBreakout.update({
      catalyst_request_status: 'external-pending',
    }, {
      where: {
        id: cohort_breakout_id,
      },
      raw: true,
    }))
    .then(() => CohortBreakout
      .findOne({
        where: {
          id: cohort_breakout_id,
        },
        include: [{
          model: User,
          attributes: ['id', 'name'],
          as: 'RequestedByCatalysts',
          through: {
            attributes: [],
          },
        }],
        // raw: true,
      }));
};

export const updateRequestStatus = ({
  user_id, cohort_breakout_id, catalyst_id,
}) => CohortBreakout.findOne({
  where: {
    id: cohort_breakout_id,
  },
  raw: true,
})
  .then(data => data.updated_by_user)
  .then(updated_by_user => {
    updated_by_user = updated_by_user ? [...updated_by_user, user_id] : [user_id];
    return CohortBreakout.update({
      catalyst_request_status: 'external-selected',
      catalyst_id,
      updated_by_user,
    }, {
      where: {
        id: cohort_breakout_id,
      },
      raw: true,
    })
      .then(() => CohortBreakout
        .findOne({
          where: {
            id: cohort_breakout_id,
          },
          include: [{
            model: User,
            attributes: ['name', 'role', 'email'],
            as: 'catalyst',
          }],
        // raw: true,
        }));
  });

const mockInterviewRubrics = [
  {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Software Engineering',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Technical Knowledge',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Core Technical',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Technical Knowledge',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Framework/Library Knowledge',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Technical Knowledge',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Tools',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Technical Knowledge',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Resume Projects Knowledge',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Technical Knowledge',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Problem Decomposition',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Computational Thinking',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'DS & Algo',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Computational Thinking',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Pattern Recognition',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Computational Thinking',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Abstraction',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Computational Thinking',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Code Readability',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Syntax and Workflow',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Defensive Coding',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Syntax and Workflow',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Code Optimization & Refactoring',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Syntax and Workflow',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Innovative/Creative',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Coder Personality',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Adaptability',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Coder Personality',
  }, {
    id: uuid(),
    created_at: new Date(),
    rubric_name: 'Thoroughness',
    program: 'tep',
    rubric_parameters: {
      1: { description: 'Needs Improvement' },
      2: { description: 'Acceptable' },
      3: { description: 'Target' },
      4: { description: 'Exemplary' },
    },
    type: 'mock-interview',
    rubric_for: 'individual',
    path: 'common',
    collective_name: 'Coder Personality',
  },
];

export const mockInterviewRubrics_seed = () => Rubrics
  .bulkCreate(mockInterviewRubrics);
