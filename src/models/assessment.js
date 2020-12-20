import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import { CohortBreakout, BreakoutWithOptions } from './cohort_breakout';
import { getLearnersFromCohorts } from './cohort';
import { LearnerBreakout } from './learner_breakout';
import { getAssessmentSlotsByProgram } from './assessment_slots';
import { changeTimezone } from './breakout_template';
import { User, getProfile } from './user';
import { getCurrentCohortMilestone } from './cohort_milestone';
import { sendMessageToSlackChannel } from '../integrations/slack/team-app/controllers/milestone.controller';

const WEEK_VALUES = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const { gte } = Sequelize.Op;

// Start date to get all assessment - 2020-04-20
export const getAllAssessments = (after_date = '2020-04-20 00:00:00+00') => CohortBreakout.findAll({
  where: {
    type: 'assessment',
    time_scheduled: { [gte]: after_date },
  },
  order: [
    ['time_scheduled', 'ASC'],
  ],
  include: [{
    model: LearnerBreakout,
    include: [{
      model: User,
      attributes: ['name'],
    }],
  }],
});

export const getAssessmentById = id => CohortBreakout.findOne(
  {
    where: {
      id,
      type: 'assessment',
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [{
      model: LearnerBreakout,
      include: [{
        model: User,
        attributes: ['name'],
      }],
    }],
  },
).then(assessment => assessment);

export const getAssessmentsByTeam = milestone_team_id => CohortBreakout.findOne(
  {
    where: {
      type: 'assessment',
      [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [{
      model: LearnerBreakout,
      include: [{
        model: User,
        attributes: ['name'],
      }],
    }],
  },
);

export const getAssessmentsByStatus = status => CohortBreakout.findAll(
  {
    where: {
      status,
      type: 'assessment',
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [{
      model: LearnerBreakout,
      include: [{
        model: User,
        attributes: ['name'],
      }],
    }],
    raw: true,
  },
);

export const getAssessmentsByUserId = learner_id => LearnerBreakout.findAll(
  {
    where: {
      learner_id,
      [Sequelize.Op.and]: Sequelize.literal("learner_review->>'type'='assessment'"),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    raw: true,
  },
);

export const getUserAndTeamAssessments = (learner_id) => LearnerBreakout.findAll(
  {
    where: {
      learner_id,
      [Sequelize.Op.and]: Sequelize.literal("learner_review->>'type'='assessment'"),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    raw: true,
  },
);

export const updateAssessment = (
  cohort_breakout_id,
  team_feedback,
  attendance_count,
  catalyst_notes,
) => CohortBreakout.update({
  team_feedback,
  attendance_count,
  catalyst_notes,
}, {
  where: {
    id: cohort_breakout_id,
  },
  returning: true,
  raw: true,
});

export const updateReviewForLearner = (
  review_feedback, learner_id, cohort_breakout_id,
  learner_feedback,
) => LearnerBreakout.update({
  review_feedback,
  learner_feedback,
  attendance: true,
}, {
  where: {
    cohort_breakout_id,
    learner_id,
  },
  returning: true,
  raw: true,
});

export const createAssessmentEntry = (learner_name, cohort_id,
  time_scheduled, duration, details, cohortName, team_feedback,
  catalyst_notes, catalyst_id, topic_id) => {
  details.learner_name = learner_name;
  details.sandbox = { template: null };
  const assessmentDetails = {
    cohort_id,
    time_scheduled,
    duration,
    catalyst_id,
    details,
    team_feedback,
    catalyst_notes,
    isVideoMeeting: false,
    isCodeSandbox: false,
    location: 'Online',
    cohortName,
    type: 'assessment',
    topic_id: [topic_id],
  };
  return BreakoutWithOptions(assessmentDetails);
};

export const addAssessmentsForTeam = (milestone_team_id, learner_feedbacks, status, team_feedback,
  additional_details) => CohortBreakout.update({
  team_feedback,
  additional_details,
  status,
}, {
  where: {
    type: 'assessment',
    [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
  },
  returning: true,
  raw: true,
}).then(cohortDetails => learner_feedbacks.map(learnerFeedback => LearnerBreakout.update({
  learner_review: learnerFeedback.details,
},
{
  where: {
    id: cohortDetails.cohort_breakout_id,
    learner_id: learnerFeedback.id,
  },
  raw: true,
})));

export const updateStatusForTeam = (milestone_team_id, status) => CohortBreakout.update({
  status,
}, {
  where: {
    type: 'assessment',
    [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
  },
});

export const calculateAssessmentTime = (assessmentDate, assessmentForTeam) => {
  let time_split = assessmentForTeam.time_scheduled.split(':');
  let scheduled_time = new Date(assessmentDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

  scheduled_time.setDate(assessmentDate.getDate() + (((
    WEEK_VALUES[assessmentForTeam.assessment_day.toLowerCase()]
    + 7 - assessmentDate.getDay()) % 7)));

  scheduled_time.setHours(time_split[0], time_split[1], time_split[2]);

  let assessmentScheduledUTC = changeTimezone(scheduled_time, 'Asia/Kolkata');
  return assessmentScheduledUTC;
};

export const createLearnerAssessmentBreakout = async (
  assessmentSlots,
  cohortLearners,
  assessment_start,
  excluded_learners,
  cohort_milestone_id,
) => {
  let {
    learners, name, id, duration, location,
  } = cohortLearners;
  let cohort_duration;
  if (duration >= 26) {
    cohort_duration = 'Part-time';
  } else {
    cohort_duration = 'Full-time';
  }
  // skipSlots is to skip if the slot is for
  // different Cohort duration
  let defaultSlot = assessmentSlots[0];
  let count = 0;
  await Promise.all(learners.map(async (eachLearner, teamIndex) => {
    let toExcludeLearner = false;
    if (Array.isArray(excluded_learners)) {
      toExcludeLearner = excluded_learners.includes(eachLearner);
    }

    if (!toExcludeLearner) {
      let learnerDetails = await getProfile(eachLearner);

      let topics = `Assessment for ${name} Learner: ${learnerDetails.name}`;

      let details = {
        topics,
        learner_id: eachLearner,
        cohort_milestone_id,
      };

      let indexForReview = 0;
      let assessmentForLearner;

      assessmentForLearner = assessmentSlots[indexForReview];

      // Remove assessment that gets assigned
      assessmentSlots.splice(indexForReview, 1);
      if (assessmentForLearner === undefined) {
        assessmentForLearner = { ...defaultSlot };
        let warning_context = `EXTRA Assessment created for ${name} ${cohort_duration} ${location} on first slot`;
        let warning_message = 'WARNING! WARNING! Extra Assessments created than available slots. Please reschedule.';
        sendMessageToSlackChannel(warning_message,
          warning_context, process.env.SLACK_PE_SCHEDULING_CHANNEL);
      }

      assessment_start = new Date(Date.parse(assessment_start));

      let timeSlot = calculateAssessmentTime(assessment_start,
        assessmentForLearner);
      count += 1;
      let { assessment_duration, reviewer, phase } = assessmentForLearner;
      return createAssessmentEntry(
        learnerDetails.name,
        id,
        timeSlot,
        assessment_duration,
        details,
        name,
        null,
        null,
        reviewer,
        phase,
      ).then(createReviewBreakout => {
        let cohort_breakout_id = createReviewBreakout.id;
        let review_feedback = { type: 'assessment' };
        LearnerBreakout.create({
          id: uuid(),
          review_feedback,
          cohort_breakout_id,
          learner_id: eachLearner,
        });
        return createReviewBreakout;
      });
    }

    return null;
  }));
  let context = `Assessments created for ${name} ${cohort_duration} ${location}`;
  let message = `Created assessments for ${count} learners`;
  try {
    sendMessageToSlackChannel(message, context, process.env.SLACK_PE_SCHEDULING_CHANNEL);
  } catch (err2) {
    console.warn('Unable to send message to slack');
  }
};

export const createAssessmentSchedule = (
  program,
  cohort_duration,
  cohort_ids,
  assessment_start,
  phase,
  excluded_learners,
) => getAssessmentSlotsByProgram(
  program,
  cohort_duration,
  phase,
)
  .then(assessmentSlots => {
    let slotsForReview = assessmentSlots;
    return getLearnersFromCohorts(cohort_ids)
      .then(async (cohortsForAssessments) => Promise.all(cohortsForAssessments.map(
        async singleCohort => {
          let cohortMilestones = await getCurrentCohortMilestone(singleCohort.id);
          return createLearnerAssessmentBreakout(
            slotsForReview, singleCohort, assessment_start,
            excluded_learners, cohortMilestones.id,
          );
        },
      )));
  });
