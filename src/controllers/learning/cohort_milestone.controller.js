import { getCurrentCohortMilestones } from '../../models/cohort_milestone';

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
