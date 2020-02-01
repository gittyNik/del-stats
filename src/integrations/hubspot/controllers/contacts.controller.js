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
    default:
      return null;
  }
}

const createProperties = data => {
  let properties = [];
  for(let key in data) {
    if(data[key]) {
      properties.push({
        property: getPropertyName(key),
        value: data[key]
      })
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
