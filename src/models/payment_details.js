import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { PaymentIntervals } from './payment_intervals';
import { Application } from './application';

const { Op } = Sequelize;

const PaymentDetails = db.define('payment_details', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  type: Sequelize.STRING,
  alias: Sequelize.STRING,
  total_fees: Sequelize.REAL,
  security_deposit: Sequelize.REAL,
  no_of_installments: Sequelize.INTEGER,
  discount: Sequelize.REAL,
  discount_amount: Sequelize.REAL,
  due_amount: Sequelize.REAL,
  installments: Sequelize.JSON,
  created_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
});

const getAllDetails = () => PaymentDetails.findAll({
  include: [{ model: PaymentIntervals, attributes: ['intervals'] }],
});

const addPaymentDetails = (details, id = null) => PaymentDetails.create({
  id: id || uuid(),
  ...details,
});

const getApplicantPlans = (applicant_id, type) => Application.findOne({
  where: {
    id: applicant_id,
  },
})
  .then(applicant => applicant.dataValues)
  .then(applicant => {
    type = type || 'upfront';
    if (applicant.upfront_plan_5_enabled) {
      return PaymentDetails.findAll({
        where: {
          type,
        },
        include: [{ model: PaymentIntervals, attributes: ['intervals'] }],
      });
    }
    return PaymentDetails.findAll({
      where: {
        [Op.and]: [
          { type },
          {
            alias: {
              [Op.ne]: 'Plan 5',
            },
          },
        ],
      },
      include: [{ model: PaymentIntervals, attributes: ['intervals'] }],
    });
  });

export {
  PaymentDetails,
  getAllDetails,
  getApplicantPlans,
  addPaymentDetails,
};
