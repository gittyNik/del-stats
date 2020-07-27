import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import { CohortBreakout, BreakoutWithOptions } from './cohort_breakout';
import { getLearnersFromCohorts } from './cohort';
import { LearnerBreakout } from './learner_breakout';
import { getAssessmentSlotsByProgram } from './assessment_slots';
import { changeTimezone } from './breakout_template';
import { User, getProfile } from './user';

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
    isCodeSandbox: true,
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

  scheduled_time.setDate(assessmentDate.getDate() + ((
    WEEK_VALUES[assessmentForTeam.assessment_day.toLowerCase()]
    + (7 * assessmentForTeam.week) - assessmentDate.getDay()) % 7));

  scheduled_time.setHours(time_split[0], time_split[1], time_split[2]);

  let assessmentScheduledUTC = changeTimezone(scheduled_time, 'Asia/Kolkata');
  return assessmentScheduledUTC;
};

export const createLearnerAssessmentBreakout = (
  assessmentSlots,
  cohortLearners,
  assessment_start,
  excluded_learners,
) => {
  let {
    learners, name, id, duration,
  } = cohortLearners;
  // skipSlots is to skip if the slot is for
  // different Cohort duration
  let skipSlots = 0;
  let subtractDeleteIndex = 0;
  return learners.forEach(async (eachLearner, teamIndex) => {
    let toExcludeLearner = false;
    if (Array.isArray(excluded_learners)) {
      toExcludeLearner = excluded_learners.includes(eachLearner);
    }

    if (!toExcludeLearner) {
      let learnerDetails = await getProfile(eachLearner);

      let topics = `Assessment for ${name} Learner: ${learnerDetails.name}`;

      let details = {
        topics,
      };

      // Assign only full-time slots to full-time assessment
      // vice versa for part-time
      // full-time will start first bo order by
      // if full time has extra slots left, skip those
      // assessmentSlots is directly modified, so works with map
      // also reduced index by the elements being removed
      let indexForReview = teamIndex + skipSlots - subtractDeleteIndex;
      while (duration !== assessmentSlots[indexForReview].cohort_duration) {
        skipSlots += 1;
      }
      let assessmentForLearner = assessmentSlots[indexForReview];
      // Remove assessment that gets assigned
      assessmentSlots.splice(indexForReview, 1);
      subtractDeleteIndex += 1;

      assessment_start = new Date(Date.parse(assessment_start));

      let timeSlot = calculateAssessmentTime(assessment_start,
        assessmentForLearner);
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
  });
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
      .then((cohortsForAssessments) => cohortsForAssessments.forEach(
        singleCohort => createLearnerAssessmentBreakout(
          slotsForReview, singleCohort, assessment_start,
          excluded_learners,
        ),
      ));
  });
