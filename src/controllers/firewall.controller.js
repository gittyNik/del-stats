import Sequelize from 'sequelize';
import Application from '../models/application';
import Program from '../models/program';
import Cohort from '../models/cohort';

export const getPublicStats = (req, res) => {
  Application.findAll()
  .then(applications => {
    res.send({ count: applications.length});
  })
  .catch(err => res.sendStatus(500))
}

export default getPublicStats;
