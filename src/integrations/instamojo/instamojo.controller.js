import { Application } from '../../models/application';

export const instamojo_webhook = (req, res) => {
  const { purpose } = req.body;

  Application.findAll({
    where: { id: purpose }, returning: true, plain: true,
  })
    .then(result => {
      // console.log(result.dataValues.payment_details);
      let old_payment_details = result.dataValues.payment_details;
      let res_data = old_payment_details.response_data;
      // console.log('old response_data:', res_data);
      res_data.push(req.body);
      // console.log('new response_data: ', res_data);
      old_payment_details.response_data = res_data;
      let payment_details = old_payment_details;

      Application.update({
        payment_details,
      }, { where: { id: purpose }, returning: true, plain: true })
        .then(result2 => {
          // console.log(result2[1].dataValues);
          // console.log(result2[1].dataValues.payment_details.response_data);
          res.status(200).send({
            text: 'response data from webhook',
            // An array of all the webhook responses.
            data: result2[1].dataValues.payment_details.response_data,
          });
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
