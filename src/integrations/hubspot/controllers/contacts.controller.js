import moment from 'moment';
import hubspot from './auth.controller';

const getPropertyName = name => {
  switch (name) {
    case 'firstName':
      return 'firstname';
    case 'lastName':
      return 'lastname';
    case 'email':
      return 'email';
    case 'phone':
      return 'phone';
    case 'location':
      return 'city';
    case 'gender':
      return 'gender';
    case 'knowAboutSOALFrom':
      return 'how_did_you_get_to_know_about_soal_';
    case 'occupationBeforeSOAL':
      return 'occupational_status';
    case 'otpVerified':
      return 'otp_verified';
    case 'birthDate':
      return 'date_of_birth';
    case 'whichCohort':
      return 'which_cohort';
    case 'program':
      return 'which_program';
    case 'utm_source':
      return 'campaign_source';
    case 'utm_medium':
      return 'campaign_source_data_1';
    case 'utm_campaign':
      return 'campaign_source_data_2';
    case 'equippedWithLaptop':
      return 'equipped_with_laptop_';
    case 'comfortableWithEnglish':
      return 'comfortable_with_english';
    case 'stableInternetConnectivity':
      return 'stable_internet_connectivity';
    case 'exclusivelyAvailableForProgram':
      return 'exclusively_available_for_program';
    case 'availableForJob':
      return 'available_for_job';
    default:
      return null;
  }
};

const createProperties = data => {
  let properties = [];
  for (let key in data) {
    if (data[key] !== undefined) {
      if (key === 'birthDate') {
        properties.push({
          property: getPropertyName(key),
          value: moment.utc(data[key]).set({
            hour: 0, minute: 0, second: 0, millisecond: 0,
          }).valueOf(),
        });
      } else {
        properties.push({
          property: getPropertyName(key),
          value: data[key],
        });
      }
    }
  }
  return {
    properties,
  };
};

export const createOrUpdateContact = data => {
  const { email } = data;
  return hubspot.contacts
    .createOrUpdate(email, createProperties(data));
};

export const getContact = (req, res) => {
  const { email } = req.query;
  hubspot.contacts.getByEmail(email).then(contact => {
    res.send({
      text: 'Hubspot contact details',
      data: contact,
    });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
};
