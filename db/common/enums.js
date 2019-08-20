// list down all the constant enum values used across database

export const TEST_QUESTION_DOMAIN = ['generic', 'tech', 'mindsets'];

export const TEST_QUESTION_TYPE = ['mcq', 'text', 'code', 'rate', 'logo'];

export const FIREWALL_APPLICATION_STATUS =
['applied', 'review_pending', 'offered', 'rejected', 'joined', 'archieved'];

export const EVENT_INVITATION_STATUS = ['invited', 'rsvp', 'attended'];

export default {
  domain: TEST_QUESTION_DOMAIN,
  question_type: TEST_QUESTION_TYPE,
  application_status: FIREWALL_APPLICATION_STATUS,
  invite_status: EVENT_INVITATION_STATUS,
};
