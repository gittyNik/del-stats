import uuid from 'uuid/v4';
import { CohortMilestone } from '../../models/cohort_milestone';
import Sequelize  from 'sequelize';


export const getUpcomingReviews = (req, res) => {
  const now = Sequelize.literal('NOW()');
  const { gt } = Sequelize.Op;
  CohortMilestone.findAll({
    where:{
      review_scheduled: { [gt]: now },
    },
    include: [Cohort, Milestone],
    raw: true,
  });
};
