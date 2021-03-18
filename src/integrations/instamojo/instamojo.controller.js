import { Application } from '../../models/application';
import db from '../../database';
import logger from '../../util/logger';

export const PAYMENT_TYPES = {
  pe_first_tranche: 'SOAL TEP-PE 1st Tranche',
  pe_second_tranche: 'SOAL TEP-PE 2nd Tranche',
};

export const instamojo_webhook = (req, res) => {
  const { payment_request_id } = req.body;
  db.query(`SELECT * FROM applications WHERE payment_details->'pe_first_tranche'->>'id'='${payment_request_id}' OR payment_details->'pe_second_tranche'->>'id'='${payment_request_id}'`, { model: Application })
    .then(applicants => {
      let { id, payment_details: old_payment_details } = applicants[0].dataValues;
      let { response_data } = old_payment_details;
      if (typeof response_data === 'undefined') response_data = [];
      response_data.push(req.body);
      old_payment_details.response_data = response_data;
      let payment_details = old_payment_details;

      Application.update({
        payment_details,
      }, { where: { id }, returning: true, plain: true })
        .then(result => {
          // logger.info('result: ', result[1].dataValues);
          let res_data = result[1].dataValues.payment_details.response_data;
          let { status } = res_data[res_data.length - 1];
          if (status === 'Credit') {
            // need to send sms to applicant regarding status.
            logger.info(`Amount Credited by Applicant id: ${id}`);
          }
          res.sendStatus(200);
        })
        .catch(err => {
          logger.error(err);
          res.sendStatus(500);
        });
    })
    .catch(err => {
      logger.error(err);
      res.sendStatus(500);
    });
};

// export const instamojoWeebhook2 = (req, res)
export default instamojo_webhook;
