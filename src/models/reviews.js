import Sequelize from 'sequelize';
import { CohortBreakout } from './cohort_breakout';
import { getLiveMilestones } from './cohort_milestone';
import { getTeamsbyCohortMilestoneId } from './team';


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

// TODO
export const getReviewsByUserId = user_id => CohortBreakout.findAll(
  {
    where: {
      type: 'reviews',
      learner_feedbacks: {
        [Sequelize.Op.contains]: [{ id: user_id }],
      },
    },
    raw: true,
  },
);

// TODO
export const createReviewEntry = (milestone_team_id, milestone_name,
  status, scheduled_at, call_details, zoom_url) => CohortBreakout.create(
  {
    milestone_team_id,
    milestone_name,
    status,
    scheduled_at,
    call_details,
    zoom_url,
  },
);

export const addReviewsForTeam = (milestone_team_id, learner_feedbacks, status, team_feedback,
  additional_details) => CohortBreakout.update({
  learner_feedbacks,
  team_feedback,
  additional_details,
  status,
}, { where: { milestone_team_id } });

export const updateStatusForTeam = (milestone_team_id, status) => CohortBreakout.update({
  status,
}, { where: { milestone_team_id } });

export const createReviewSchedule = (reviewSlots) => getLiveMilestones()
  .then(deadlineMilestones => {
    console.log(deadlineMilestones);

    deadlineMilestones.map((cohortMilestone) => {
      getTeamsbyCohortMilestoneId(cohortMilestone.id).then(learnerTeams => {
        learnerTeams.map((eachTeam) => {
          console.log(eachTeam);
        });
      });
    });
  });
