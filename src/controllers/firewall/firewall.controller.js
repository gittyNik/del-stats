import Sequelize from 'sequelize';
import Application from '../../models/application';
import Program from '../../models/program';
import Cohort from '../../models/cohort';

const getUpcomingCohort = () => {
  const tonight = new Date();
  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return Cohort.findOne({
    where: {
      start_date: { [Sequelize.Op.gt]: tonight },
    },
  });
};

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
    .catch(err => res.sendStatus(500));
};

export default getPublicStats;
