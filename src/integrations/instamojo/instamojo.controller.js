import { Application } from '../../models/application';
import db from '../../database';

export const instamojo_webhook = (req, res) => {
  const { payment_request_id } = req.body;

  db.query(`SELECT * FROM applications WHERE payment_details->'payment_request'->>'id'='${payment_request_id}'`, { model: Application })
    .then(applicants => {
      // console.log('dataValue:', applicants[0].dataValues);
      let applicant_id = applicants[0].dataValues.id;
      let old_payment_details = applicants[0].dataValues.payment_details;
      let { response_data } = old_payment_details;
      response_data.push(req.body);
      old_payment_details.response_data = response_data;
      let payment_details = old_payment_details;

      // updating the payment_details JSON object with the data from webhook
      Application.update({
        payment_details,
      }, { where: { id: applicant_id }, returning: true, plain: true })
        .then(result => {
          // console.log('result: ', result[1].dataValues);
          let res_data = result[1].dataValues.payment_details.response_data;
          let { status } = res_data[res_data.length - 1];
          if (status === 'Credit') {
            // need to send sms to applicant regarding status.
            console.log(`Amount Credited by Applicant id: ${applicant_id}`);
          }
          res.sendStatus(200);
        })
        .catch(err => {
          console.error(err);
          res.sendStatus(500);
        });
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export default instamojo_webhook;
