import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';

const PaymentIntervals = db.define('payment_intervals', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    payment_details_id: {
      type: Sequelize.UUID,
      allowNull: false
    },
    interval_1: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    interval_2: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    interval_3: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    interval_4: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    interval_5: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }
  });

export {
  PaymentIntervals
};
