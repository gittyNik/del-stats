import hubspot from "./auth.controller";

const getPropertyName = name => {
	switch (name) {
		case "name":
			return "dealname";
		case "email":
			return "email_id";
		case "phone":
			return "contact_number";
		case "program":
			return "program_chosen"
		case "format":
			return "format";
		case "preferredCampus":
			return "preferred_campus";
		case "cohortStartDate":
			return "cohort_start_date";
		case "applicantStatus":
			return "applicant_status"
		default:
			return null;
	}
}

const createProperties = data => {
	let properties = [];
	for (let key in data) {
		if (data[key] !== undefined) {
			// TODO: format date and add it to the property
			if (key !== "birthDate") {
				const propertyName = getPropertyName(key);
				properties.push({
					name: propertyName,
					value: data[key]
				})
			}
		}
	}
	return {
		properties
	}
}

export const createDeal = data => {
	return hubspot.deals.create(createProperties(data));
};

export const updateDealApplicationStatus = (dealId, status) => {
	let hubspotStatus;
	if (status === "applied") {
		hubspotStatus = "Test In Progress";
	} else if (status === "review_pending") {
		hubspotStatus = "Review Pending";
	} else if (status === "offered") {
		hubspotStatus = "Offered";
	} else if (status === "rejected") {
		hubspotStatus = "Rejected";
	}
	const updateObj = {
		properties: [{
			name: "applicant_status",
			value: hubspotStatus
		}, ],
	};
	return hubspot.deals.updateById(dealId, updateObj);
}

export const associateDealWithContact = (dealId, contactId) => {
	return hubspot.deals.associate(dealId, "CONTACT", contactId);
}