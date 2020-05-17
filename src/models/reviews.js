import Sequelize from 'sequelize';
import { CohortBreakout, BreakoutWithOptions } from './cohort_breakout';
import { getLiveMilestones } from './cohort_milestone';
import { getTeamsbyCohortMilestoneId } from './team';
import { LearnerBreakout } from './learner_breakout';

const GITHUB_BASE = process.env.GITHUB_TEAM_BASE;


export const getAllReviews = () => CohortBreakout.findAll({
  where: { type: 'reviews' },
});

export const getReviewsById = id => CohortBreakout.findOne(
  {
    where: {
      id,
      type: 'reviews',
    },
  },
).then(reviews => reviews);

export const getReviewsByTeam = milestone_team_id => CohortBreakout.findOne(
  {
    where: {
      type: 'reviews',
      [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
    },
  },
);

export const getReviewsByStatus = status => CohortBreakout.findAll(
  {
    where: {
      status,
      type: 'reviews',
    },
    raw: true,
  },
);

export const getReviewsByUserId = learner_id => LearnerBreakout.findAll(
  {
    where: {
      learner_id,
      [Sequelize.Op.and]: Sequelize.literal("learner_feedback->>'type'='reviews'"),
    },
    raw: true,
  },
);

export const getUserAndTeamReviews = (learner_id) => LearnerBreakout.findAll(
  {
    where: {
      learner_id,
      [Sequelize.Op.and]: Sequelize.literal("learner_feedback->>'type'='reviews'"),
    },
    raw: true,
  },
).then(learnerReviews => learnerReviews.map(learnerReview => CohortBreakout.findOne(
  {
    where: {
      type: 'reviews',
      id: learnerReview.cohort_breakout_id,
    },
    raw: true,
  },
)));


export const createReviewEntry = (milestone_team_id, cohort_id,
  time_scheduled, duration, catalyst_id, details, team_feedback,
  cohortName, catalyst_notes) => {
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

export const createReviewSchedule = (reviewSlots) => getLiveMilestones()
  .then(deadlineMilestones => {
    let nextWeekCohorts = deadlineMilestones;
    let lastCohort = deadlineMilestones[deadlineMilestones.length - 1];
    let programDuration = lastCohort['cohort.duration'];

    return deadlineMilestones.map((cohortMilestone) => {
      let milestonecohort = cohortMilestone;
      getTeamsbyCohortMilestoneId(
        cohortMilestone.id,
      ).then(learnerTeams => {
        learnerTeams.map((eachTeam) => {
          console.log(milestonecohort);
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
          };
          github_repo_link = GITHUB_BASE + github_repo_link;
          createReviewEntry(id, cohort_id, details, cohortName);
          console.log(eachTeam);
        });
      });
    });
  });
