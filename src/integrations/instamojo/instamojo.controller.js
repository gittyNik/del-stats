
export const instamojo_webhook = (req, res) => {
  const {
    amount, buyer, buyer_name, buyer_phone, fees,
    longurl, mac, payment_id, payment_request_id,
    purpose, shorturl, status,
  } = req.body;
  // todo:  handle this data
};

export default instamojo_webhook;
