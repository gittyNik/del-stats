import { Application } from '../../models/application';
import { getUpcomingCohort } from '../../models/cohort';

export const getPublicStats = async (req, res) => {
  const cohort = await getUpcomingCohort();

  Application.findAll()
    .then((applications) => {
      const currentApplications = applications.filter(a => a.cohort_applied === cohort.id);
      res.send({
        cohort: {
          total: currentApplications.length,
          pending: currentApplications.filter(a => a.status === 'review_pending').length,
        },
        count: applications.length,
      });
    })
    .catch(() => res.sendStatus(500));
};

export default getPublicStats;
