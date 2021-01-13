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
    intervals: Sequelize.JSON,
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    },
    updated_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('NOW()'),
    }
  });


const addPaymentIntervals = (intervals, id=null) => PaymentIntervals.create({
  id: id || uuid(),
  ...intervals
})

export {
  PaymentIntervals,
  addPaymentIntervals
};
