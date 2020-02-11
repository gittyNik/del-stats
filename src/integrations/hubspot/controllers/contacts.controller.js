import hubspot from "./auth.controller";

const getPropertyName = name => {
  switch(name) {
    case "firstName":
      return "firstname";
    case "lastName":
      return "lastname";
    case "email":
      return "email";
    case "phone":
      return "phone";
    case "location":
      return "city";
    case "gender":
      return "gender";
    case "knowAboutSOALFrom":
      return "how_did_you_get_to_know_about_soal_";
    case "occupationBeforeSOAL":
      return "occupational_status";
    case "otpVerified":
      return "otp_verified";
    case "birthDate":
      return "date_of_birth";
    case "whichCohort":
      return "which_cohort";
    case "program":
      return "which_program";
    default:
      return null;
  }
}

const createProperties = data => {
  let properties = [];
  for(let key in data) {
    if(data[key] !== undefined) {
      // TODO: format date and add it to the property
      if(key !== "birthDate") {
        properties.push({
          property: getPropertyName(key),
          value: data[key]
        })
      }
    }
  }
  return {
    properties
  }
}

export const createOrUpdateContact = data => {
  const { email } = data;
  return hubspot.contacts
    .createOrUpdate(email, createProperties(data));
};

export const getContact = (req, res) => {
  const { email } = req.query;
  hubspot.contacts.getByEmail(email).then(contact => {
    res.send({
      text: "Hubspot contact details",
      data: contact
    });
  }).catch(err => {
    console.log(err);
    res.sendStatus(500)
  })
}
