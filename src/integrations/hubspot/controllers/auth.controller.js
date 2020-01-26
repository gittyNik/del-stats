import Hubspot from 'hubspot';

const { HUBSPOT_API_KEY } = process.env;

const hubspot = new Hubspot({ 
	apiKey: HUBSPOT_API_KEY,
	checkLimit: false // (Optional) Specify whether to check the API limit on each call. Default: true 
})

export default hubspot;