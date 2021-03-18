import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import db from '../database';

export const PaymentIntervals = db.define('payment_intervals', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  payment_details_id: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  intervals: Sequelize.JSON,
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

export const addPaymentIntervals = (intervals, id = null) => PaymentIntervals.create({
  id: id || uuid(),
  ...intervals,
});
