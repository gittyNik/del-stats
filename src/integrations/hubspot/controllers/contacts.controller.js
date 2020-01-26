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
  hubspot.contacts
    .createOrUpdate(email, createObj)
    .then(result => {
      console.log("Hubspot create contact", result);
    })
    .catch(err => {
      console.log("Hubspot create contact error", err);
    });
};
