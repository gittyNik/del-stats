import hubspot from "./auth.controller";


export const createDeal = user => {
	const { name, email, phone } = user;
	const createObj = {
		properties: [
			{ name: "dealname", value: name },
			{ name: "email_id", value: email },
			{ name: "contact_number", value: phone },
			{ name: 'dealstage', value: 'appointmentscheduled' },
			{ name: 'applicant_status', value: 'Applicant' },
		]
	};
	return hubspot.deals.create(createObj);
};

export const updateDealApplicationStatus = (dealId, status) => {
	let hubspotStatus;
	if(status === "applied") {
		hubspotStatus = "Test In Progress";
	} else if(status === "review_pending") {
    hubspotStatus = "Review Pending";
  } else if(status === "offered") {
    hubspotStatus = "Offered";
  } else if(status === "rejected") {
    hubspotStatus = "Rejected";
	}
	console.log("Hubspot stats", hubspotStatus, dealId)
	const updateObj = {
		properties : [
			{name: "applicant_status", value: hubspotStatus},
		],
	};
	return hubspot.deals.updateById(dealId, updateObj);
}

export const associateDealWithContact = (dealId, contactId) => {
	return hubspot.deals.associate(dealId, "CONTACT", contactId);
}