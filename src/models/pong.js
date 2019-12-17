import Sequelize from 'sequelize';
import db from '../database';

export const Pong = db.define('pongs', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
  },
  ping_id: {
    type: Sequelize.UUID,
    references: { model: 'pings', key: 'id' },
  },
  learner_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id'},
  },
  response: Sequelize.JSON,
})

export default Pong;