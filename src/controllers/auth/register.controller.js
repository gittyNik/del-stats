import { v4 as uuid } from "uuid";
import {
  Application,
  updateApplicationStatusByUserId,
} from "../../models/application";
import {
  getOrCreateUser,
  getUserById,
  updateUserById,
} from "../../models/user";
import { createOrUpdateContact } from "../../integrations/hubspot/controllers/contacts.controller";
import {
  createContactAssociateDeal,
  getApplicationStatus,
} from "../../integrations/hubspot/controllers/deals.controller";

const createApplication = (data) =>
  Application.create({
    id: uuid(),
    status: "applied",
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  });

export const registerUser = async (req, res) => {
  const { name, email, phone, program, test_base_url } = req.body;
  try {
    const data = {
      name,
      email: email.toLowerCase(),
      phone,
    };
    const user = await getOrCreateUser({ email, phone }, data);
    const test_url = `${test_base_url}?name=${name}&email=${email}&phone=${phone}&id=${user[0].id}`;
    const applicationData = {
      user_id: user[0].id,
      program_id: program,
    };
    const [application, contact] = await Promise.all([
      createApplication(applicationData),
      createOrUpdateContact({ email, test_url }),
    ]);
    res.status(201).json({
      type: "success",
      message: "User and Application created",
      data: {
        user,
        application,
      },
    });
  } catch (err) {
    console.log("ERRRROR CREATE USER", err);
    res.status(500).json({
      type: "failure",
      message: err,
    });
  }
};

// jotform application update controller
export const updateApplication = async (req, res) => {
  const formData = JSON.parse(req.body.rawRequest);
  const {
    q49_name: name,
    q50_email: email,
    q61_phone: phone,
    q151_id: user_id,
    q150_offered: offered,
    q60_dateOf60: dob_object,
  } = formData;
  const dob = new Date(
    `${dob_object.month}-${dob_object.day}-${dob_object.year}`
  );
  let status;
  if (offered == 1) {
    status = "offered";
  } else if (offered == 0) {
    status = "rejected";
  } else {
    status = "applied";
  }
  try {
    const user = await getUserById(user_id);

    const contactPayload = {
      email,
      birthDate: dob,
    };
    const dealPayload = {
      name,
      email,
      phone,
      birthDate: dob,
      uaasApplicationStatus: getApplicationStatus(status),
    };
    const [application, deal] = await Promise.all([
      updateApplicationStatusByUserId(user.id, status),
      createContactAssociateDeal(contactPayload, dealPayload),
    ]);

    const userData = {
      profile: {
        ...user.profile,
        birthDate: dob,
        hubspotDealId: deal.dealId,
      },
      updated_at: new Date(),
    };
    await updateUserById(user_id, userData);

    res.status(200).json({
      type: "success",
      message: "Application updated",
      data: {
        user: user,
        application: application,
      },
    });
  } catch (err) {
    console.log("ERROR updating application status", err);
    res.status(500).json({
      type: "failure",
      message: err,
    });
  }
};
