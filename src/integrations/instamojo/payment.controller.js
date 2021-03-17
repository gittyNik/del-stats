import request from 'superagent';

const {
  INSTAMOJO_URL,
  INSTAMOJO_API_KEY,
  INSTAMOJO_AUTH_TOKEN,
} = process.env;

const getPaymentDetails = ({ payment_id }) => request
  .post(`${INSTAMOJO_URL}/payments/${payment_id}`)
  .set('X-Api-Key', INSTAMOJO_API_KEY)
  .set('X-Auth-Token', INSTAMOJO_AUTH_TOKEN)
  .then(response => response.body)
  .catch(err => {
    throw new Error(`Unable to fetch payment details for payment id: ${payment_id}\n ${err}`);
  });

const getPaymentDetailsByRequestId = ({ payment_request_id }) => request
  .post(`${INSTAMOJO_URL}/payment-requests/${payment_request_id}`)
  .set('X-Api-Key', INSTAMOJO_API_KEY)
  .set('X-Auth-Token', INSTAMOJO_AUTH_TOKEN)
  .then(response => response.body)
  .catch(err => {
    throw new Error(`Unable to fetch payment details for payment id: ${payment_request_id}\n ${err}`);
  });

export const checkPaymentStatus = ({ payment_id, payment_request_id }) => {
  if (payment_id) {
    return getPaymentDetails({ payment_id })
      .then(data => (data.payment.status === 'Credit' ? 'Payment Successful' : 'Payment Failed'))
      .catch(err => {
        throw new Error(`Unable to fetch payment details for payment id: ${payment_id}\n ${err}`);
      });
  }
  return getPaymentDetailsByRequestId({ payment_request_id })
    .then(data => (
      // eslint-disable-next-line no-nested-ternary
      data.payment_request.payments[0] ? (
        data.payment_request.payments[0].status === 'Credit'
          ? 'Payment Successful' : 'Payment Failed') : 'No Payment Made'))
    .catch(err => {
      throw new Error(`Unable to fetch payment details for payment id: ${payment_id}\n ${err}`);
    });
};

export default checkPaymentStatus;
