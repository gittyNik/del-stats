import hubspot from "./auth.controller";
import moment from "moment";

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
			return "applicant_status";
		case "dateOfStartTest":
			return "date_of_start_test";
		case "dateOfTestCompletion":
			return "date_of_test_completion";
		case "dateOfReview":
			return "date_of_review";
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
	let testTime;
	if (status === "applied") {
		hubspotStatus = "Test In Progress";
		testTime = {
			name: "date_of_start_test",
			value: moment.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0}).valueOf()
		}
	} else if (status === "review_pending") {
		hubspotStatus = "Review Pending";
		testTime = {
			name: "date_of_test_completion",
			value: moment.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0}).valueOf()
		}
	} else if (status === "offered") {
		hubspotStatus = "Offered";
		testTime = {
			name: "date_of_review",
			value: moment.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0}).valueOf()
		}
	} else if (status === "rejected") {
		hubspotStatus = "Rejected";
		testTime = {
			name: "date_of_review",
			value: moment.utc().set({hour: 0, minute: 0, second: 0, millisecond: 0}).valueOf()
		}
	}
	const updateObj = {
		properties: [{
			name: "applicant_status",
			value: hubspotStatus
		},
		testTime ],
	};
	return hubspot.deals.updateById(dealId, updateObj);
}

export const associateDealWithContact = (dealId, contactId) => {
	return hubspot.deals.associate(dealId, "CONTACT", contactId);
}

export const getDealById = (req, res) => {
  const { hubspotDealId } = req.query;
  hubspot.deals.getById(hubspotDealId).then(deal => {
    res.send({
      text: "Hubspot Deal details",
      data: deal
    });
  }).catch(err => {
    console.log(err);
    res.sendStatus(500)
  })
}