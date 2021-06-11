import moment from 'moment';
import hubspot from './auth.controller';
import logger from '../../../util/logger';
import { createOrUpdateContact } from "./contacts.controller";

const getPropertyName = (name) => {
  switch (name) {
    case "name":
      return "dealname";
    case "email":
      return "email_id";
    case "phone":
      return "contact_number";
    case "program":
      return "program_chosen";
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
    case "birthDate":
      return "date_of_birth";
    case "uaasApplicationStatus":
      return "applicant_status_uaas";
    default:
      return null;
  }
};

export const getApplicationStatus = (status) => {
  switch (status) {
    case "applied":
      return "Test In Progress";
    case "review_pending":
      return "Review Pending";
    case "offered":
      return "Offered";
    case "rejected":
      return "Rejected";
    default:
      return null;
  }
};

const createProperties = data => {
  let properties = [];
  // eslint-disable-next-line no-restricted-syntax
  for (let key in data) {
    if (data[key] !== undefined) {
      if (key === "birthDate") {
        properties.push({
          name: getPropertyName(key),
          value: moment
            .utc(data[key])
            .set({
              hour: 0,
              minute: 0,
              second: 0,
              millisecond: 0,
            })
            .valueOf(),
        });
      } else {
        properties.push({
          name: getPropertyName(key),
          value: data[key],
        });
      }
    }
  }
  return {
    properties,
  };
};

export const createDeal = data => hubspot.deals.create(createProperties(data));

export const updateDealApplicationStatus = (dealId, status) => {
  let hubspotStatus;
  let testTime;
  if (status === 'applied') {
    hubspotStatus = 'Test In Progress';
    testTime = {
      name: 'date_of_start_test',
      value: moment.utc().set({
        hour: 0, minute: 0, second: 0, millisecond: 0,
      }).valueOf(),
    };
  } else if (status === 'review_pending') {
    hubspotStatus = 'Review Pending';
    testTime = {
      name: 'date_of_test_completion',
      value: moment.utc().set({
        hour: 0, minute: 0, second: 0, millisecond: 0,
      }).valueOf(),
    };
  } else if (status === 'offered') {
    hubspotStatus = 'Offered';
    testTime = {
      name: 'date_of_review',
      value: moment.utc().set({
        hour: 0, minute: 0, second: 0, millisecond: 0,
      }).valueOf(),
    };
  } else if (status === 'rejected') {
    hubspotStatus = 'Rejected';
    testTime = {
      name: 'date_of_review',
      value: moment.utc().set({
        hour: 0, minute: 0, second: 0, millisecond: 0,
      }).valueOf(),
    };
  }
  const updateObj = {
    properties: [{
      name: 'applicant_status',
      value: hubspotStatus,
    },
    testTime],
  };
  return hubspot.deals.updateById(dealId, updateObj);
};

export const associateDealWithContact = (dealId, contactId) => hubspot.deals.associate(dealId, 'CONTACT', contactId);

export const getDealById = (req, res) => {
  const { hubspotDealId } = req.query;
  hubspot.deals.getById(hubspotDealId).then(deal => {
    res.send({
      text: 'Hubspot Deal details',
      data: deal,
    });
  }).catch(err => {
    logger.error(err);
    res.sendStatus(500);
  });
};

export const createContactAssociateDeal = async (
  contactPayload,
  dealPayload
) => {
  const contact = await createOrUpdateContact(contactPayload);
  const deal = await createDeal(dealPayload);
  await associateDealWithContact(deal.dealId, contact.vid);
  return deal;
};
