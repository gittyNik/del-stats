import hubspot from "./auth.controller";

export const createDeal = user => {
	const { name } = user;
	const createObj = {
		properties: [
			{ name: "dealname", value: name },
			{ name: 'dealstage', value: 'appointmentscheduled' },

		]
	};
	return hubspot.deals.create(createObj);
};