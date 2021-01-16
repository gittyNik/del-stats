import request from "superagent";

const getPaymentDetails = ({ payment_id }) => {
	const {
		INSTAMOJO_URL,
		INSTAMOJO_API_KEY,
		INSTAMOJO_AUTH_TOKEN
	} = process.env;
	return request
	.post(`${INSTAMOJO_URL}/payments/${payment_id}`)
	.set('X-Api-Key', INSTAMOJO_API_KEY)
    .set('X-Auth-Token', INSTAMOJO_AUTH_TOKEN)
    .then(response => response)
    .catch(err => throw `Unable to fetch payment details for payment id: ${payment_id}`);
}

const checkPaymentStatus = ({ payment_id }) =>
	getPaymentDetails({ payment_id })
	.then(data => data.payment.status === "Credit" ? "Payment Successful": "Payment Failed")
	// .catch(err => err)

export {
	checkPaymentStatus
};