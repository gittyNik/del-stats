import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import { CohortBreakout, BreakoutWithOptions } from './cohort_breakout';
import { getLiveMilestones } from './cohort_milestone';
import { getTeamsbyCohortMilestoneId } from './team';
import { LearnerBreakout } from './learner_breakout';
import { getReviewSlotsByProgram } from './review_slots';
import { changeTimezone } from './breakout_template';

const GITHUB_BASE = process.env.GITHUB_TEAM_BASE;

const WEEK_VALUES = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

// TODO: Filter by date, only 7 days
export const getAllReviews = () => CohortBreakout.findAll({
  where: { type: 'reviews' },
  order: [
    ['time_scheduled', 'ASC'],
  ],
  include: [LearnerBreakout],
});

export const getReviewsById = id => CohortBreakout.findOne(
  {
    where: {
      id,
      type: 'reviews',
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [LearnerBreakout],
  },
).then(reviews => reviews);

export const getReviewsByTeam = milestone_team_id => CohortBreakout.findOne(
  {
    where: {
      type: 'reviews',
      [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [LearnerBreakout],
  },
);

export const getReviewsByStatus = status => CohortBreakout.findAll(
  {
    where: {
      status,
      type: 'reviews',
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [LearnerBreakout],
    raw: true,
  },
);

export const getReviewsByUserId = learner_id => LearnerBreakout.findAll(
  {
    where: {
      learner_id,
      [Sequelize.Op.and]: Sequelize.literal("learner_review->>'type'='reviews'"),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [LearnerBreakout],
    raw: true,
  },
);

export const getUserAndTeamReviews = (learner_id) => LearnerBreakout.findAll(
  {
    where: {
      learner_id,
      [Sequelize.Op.and]: Sequelize.literal("learner_review->>'type'='reviews'"),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [LearnerBreakout],
    raw: true,
  },
);

export const updateTeamReview = (
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


export const createReviewEntry = (milestone_team_id, cohort_id,
  time_scheduled, duration, details, cohortName, team_feedback,
  catalyst_notes, catalyst_id) => {
  details.milestone_team_id = milestone_team_id;
  const reviewDetails = {
    cohort_id,
    time_scheduled,
    duration,
    catalyst_id,
    details,
    team_feedback,
    catalyst_notes,
    isVideoMeeting: true,
    isCodeSandbox: false,
    location: 'Online',
    cohortName,
    type: 'reviews',
    topic_id: ['760fd87b-b5af-409a-b4ba-2f7351ef82cd'], // Topic id for Deep dives
  };
  return BreakoutWithOptions(reviewDetails);
};


export const addReviewsForTeam = (milestone_team_id, learner_feedbacks, status, team_feedback,
  additional_details) => CohortBreakout.update({
  team_feedback,
  additional_details,
  status,
}, {
  where: {
    type: 'reviews',
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
    type: 'reviews',
    [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
  },
});

export const calculateReviewTime = (reviewDate, reviewForTeam) => {
  let time_split = reviewForTeam.time_scheduled.split(':');
  let scheduled_time = new Date(reviewDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

  scheduled_time.setDate(reviewDate.getDate() + ((
    WEEK_VALUES[reviewForTeam.review_day.toLowerCase()] + 7 - reviewDate.getDay()) % 7));

  scheduled_time.setHours(time_split[0], time_split[1], time_split[2]);

  let reviewScheduledUTC = changeTimezone(scheduled_time, 'Asia/Kolkata');
  return reviewScheduledUTC;
};

export const createTeamReviewBreakout = (reviewSlots, cohortMilestone) => {
  let milestonecohort = cohortMilestone;
  // skipSlots is to skip if the slot is for
  // different Cohort duration
  let skipSlots = 0;
  let subtractDeleteIndex = 0;
  return getTeamsbyCohortMilestoneId(
    milestonecohort.id,
  ).then(learnerTeams => learnerTeams.forEach((eachTeam, teamIndex) => {
    let {
      cohort_id,
      'cohort.name': cohortName,
      'milestone.name': milestoneName,
      'milestone.id': milestoneId,
      'milestone.starter_repo': milestoneRepo,
      'cohort.location': cohortLocation,
      'cohort.program_id': programId,
      'cohort.duration': cohortDuration,
    } = milestonecohort;

    milestoneRepo = GITHUB_BASE + milestoneRepo;
    let {
      cohort_milestone_id,
      github_repo_link,
      id,
      learners,
    } = eachTeam;

    let teamArrayId = github_repo_link.split('_');
    let teamId = teamArrayId[teamArrayId.length - 1];

    let topics = `Review for ${cohortName} Team: ${teamId}`;

    github_repo_link = GITHUB_BASE + github_repo_link;

    let details = {
      cohort_milestone_id,
      github_repo_link,
      milestoneName,
      cohortName,
      milestoneId,
      milestoneRepo,
      cohortLocation,
      programId,
      cohortDuration,
      topics,
      teamId,
    };

    // Assign only full-time slots to full-time reviews
    // vice versa for part-time
    // full-time will start first bo order by
    // if full time has extra slots left, skip those
    // reviewSlots is directly modified, so works with map
    // also reduced index by the elements being removed
    let indexForReview = teamIndex + skipSlots - subtractDeleteIndex;
    while (cohortDuration !== reviewSlots[indexForReview].cohort_duration) {
      skipSlots += 1;
    }
    let reviewForTeam = reviewSlots[indexForReview];
    // Remove review that gets assigned
    reviewSlots.splice(indexForReview, 1);
    subtractDeleteIndex += 1;

    let timeSlot = calculateReviewTime(milestonecohort.review_scheduled, reviewForTeam);
    let { review_duration } = reviewForTeam;
    return createReviewEntry(
      id,
      cohort_id,
      timeSlot,
      review_duration,
      details,
      cohortName,
    ).then(createReviewBreakout => {
      let cohort_breakout_id = createReviewBreakout.id;
      let review_feedback = { type: 'review' };
      learners.map(learner_id => LearnerBreakout.create({
        id: uuid(),
        review_feedback,
        cohort_breakout_id,
        learner_id,
      }));
      return createReviewBreakout;
    });
  }));
};

export const createReviewSchedule = (program) => getReviewSlotsByProgram(program)
  .then(reviewSlots => {
    let slotsForReview = reviewSlots;
    return getLiveMilestones()
      .then((deadlineMilestones) => deadlineMilestones.forEach(
        cohortMilestone => createTeamReviewBreakout(
          slotsForReview, cohortMilestone,
        ),
      ));
  });
