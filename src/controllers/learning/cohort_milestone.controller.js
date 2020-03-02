import { getCurrentCohortMilestones, getCurrentMilestoneOfCohort } from '../../models/cohort_milestone';

export const getUpcomingReviews = (req, res) => {
  getCurrentCohortMilestones()
    .then(milestones => milestones.map(m => m.get({ plain: true })))
    .then(milestones => {
      res.send({ data: { milestones } });
    }).catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
};

export const getCohortLiveMilestone = (req, res) => {
  const user_id = req.jwtData.user.id;
  const { cohort_id } = req.params;
  getCurrentMilestoneOfCohort(cohort_id, user_id)
    .then(milestone => {
      res.send({ 
        text: "Live Milestone of Cohort",
        data: milestone
      });
    }).catch((e) => {
      console.error(e);
      res.sendStatus(500);
    });
};
