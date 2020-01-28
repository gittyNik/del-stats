import hubspot from "./auth.controller";

export const createOrUpdateContact = user => {
  const { email, firstName, lastName, phone} = user;
  const createObj = {
    properties: [
      { property: "firstname", value: firstName },
      { property: "lastname", value: lastName },
      { property: "email", value: email },
      { property: "phone", value: phone },
    ]
  };
  return hubspot.contacts
    .createOrUpdate(email, createObj);
};

export const updateContact = user => {
  const { location, profile, email } = user;
  const { birthDate, gender, occupationBeforeSOAL, knowAboutSOALFrom } = profile;

  // const date = new Date(birthDate);

  // TO-DO: update date property with correct format
  const updateObj = {
    properties: [
      // { property: "date_of_birth", value: dateUTC },
      { property: "gender", value: gender },
      { property: "city", value: location },
      { property: "how_did_you_get_to_know_about_soal_", value: knowAboutSOALFrom },
      { property: "occupational_status", value: occupationBeforeSOAL }
    ]
  }
  return hubspot.contacts.updateByEmail(email, updateObj);
}
