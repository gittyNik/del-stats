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
  // TO-DO: update other properties
  const updateObj = {
    properties: [
      { property: "date_of_birth", value: birthDate },
      { property: "gender", value: gender },
      { property: "city", value: location },
    ]
  }
  return hubspot.contacts.updateByEmail(email, updateObj);
}
