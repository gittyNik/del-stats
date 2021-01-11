import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import db from '../database';
import { PaymentIntervals } from './payment_intervals'
import { Application } from './application';

const TYPE = ['upfront', 'loan']

const { Op } = Sequelize;

const PaymentDetails = db.define('payment_details', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    type: Sequelize.ENUM(...TYPE),
    alias: Sequelize.STRING,
    total_fees: Sequelize.INTEGER,
    security_deposit: Sequelize.INTEGER,
    no_of_installments: Sequelize.INTEGER,
    discount: Sequelize.INTEGER,
    discount_amount: Sequelize.INTEGER,
    due_amount: Sequelize.INTEGER,
    installment_1: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_2: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_3: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_4: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_5: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    installment_6: {
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


const getAllDetails = () => PaymentDetails.findAll({
  include: [{ model: PaymentIntervals, attributes: ['interval_1', 'interval_2', 'interval_3', 'interval_4', 'interval_5']}]
})

const getApplicantPlans = (applicant_id) => {
  return Application.findOne({
    where: {
      id: applicant_id
    }
  })
  .then(applicant => applicant.dataValues)
  .then(applicant => {
    if (applicant.upfront_plan_5_enabled) {
      return PaymentDetails.findAll({
        where: {
          type: "upfront"
        },
        include: [{ model: PaymentIntervals, attributes: ['interval_1', 'interval_2', 'interval_3', 'interval_4', 'interval_5']}]
      })
    } else {
      return PaymentDetails.findAll({
        where: {
          [Op.and]: [
            {type: "upfront"},
            {
              alias: {
                [Op.ne]: "Plan 5"
              }
            }  
          ]
        },
        include: [{ model: PaymentIntervals, attributes: ['interval_1', 'interval_2', 'interval_3', 'interval_4', 'interval_5']}]
      })
    }
  })
}

export {
  PaymentDetails,
  getAllDetails,
  getApplicantPlans
};
