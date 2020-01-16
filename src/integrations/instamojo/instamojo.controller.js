
export const instamojo_webhook = (req, res) => {
  const {
    amount, buyer, buyer_name, buyer_phone, fees,
    currency, longurl, mac, payment_id,
    payment_request_id, purpose, shorturl, status,
  } = req.body;
  // todo:  handle this data
  console.log(req.body);
  res.sendStatus(200);
};

export default instamojo_webhook;
