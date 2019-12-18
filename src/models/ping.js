import Sequelize from 'sequelize';
import db from '../database';

export const PING_TYPE = ['immediate', 'trigger'];
export const PING_STATUS = ['draft', 'sent', 'delivered'];

export const Ping = db.define('pings', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false,
  },
  ping_template_id: {
    type: Sequelize.UUID,
    references: { model: 'ping_templates', key: 'id' },
  },
  type: Sequelize.ENUM(...PING_TYPE),
  trigger: Sequelize.JSON, // {type: 'breakout', id: 'uuid'}
  educator_id: {
    type: Sequelize.UUID,
    references: { model: 'users', key: 'id' },
  },
  recipiens: Sequelize.ARRAY(Sequelize.UUID),
  status: Sequelize.ENUM(...PING_STATUS),
  time_scheduled: Sequelize.DATE,
});

export default Ping;
