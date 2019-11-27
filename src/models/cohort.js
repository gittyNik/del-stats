import Sequelize from 'sequelize';
import Program from './program';
import db from '../database';

export const Cohort = db.define('cohorts', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  location: Sequelize.STRING,
  learners: Sequelize.ARRAY(Sequelize.UUID),
  program_id: Sequelize.STRING,
  start_date: Sequelize.DATE,
  learning_ops_manager: Sequelize.UUID,
});

Program.hasMany(Cohort, { foreignKey: 'program_id' });

export const getCohortsStartingToday = () => {
  const today = new Date();
  const tonight = new Date();

  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return Cohort.findAll({
    where: {
      start_date: { $between: [today, tonight] },
    },
  });
};

export const getFutureCohorts = () => {
  const tonight = new Date();

  tonight.setHours(23);
  tonight.setMinutes(59);
  tonight.setSeconds(59);

  return Cohort.findAll({
    where: {
      start_date: { [Sequelize.Op.gt]: tonight },
    },
  });
};

// TODO: Optimize this later
export const getCohortLearnerDetails = ({ name, location, year }) => {
  const yearStart = new Date(new Date(0).setFullYear(year));
  const yearEnd = new Date(new Date(0).setFullYear(year + 1) - 1);

  return Cohort.findAll({
    where: {
      name,
      location,
      start_date: { [Sequelize.Op.between]: [yearStart, yearEnd] },
    },
    raw: true,
  })
    .then((cohorts) => {
      const learnerGetters = cohorts.map(cohort => User.findAll({
        where: { id: { [Sequelize.Op.in]: cohort.learners } },
      })
        .then((learners) => {
          cohort.learnerDetails = learners;
          return cohort;
        }));
      return Promise.all(learnerGetters);
    });
};
