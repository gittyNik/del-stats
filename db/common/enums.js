// list down all the constant enum values used across database

export const TEST_QUESTION_DOMAIN = ['generic', 'tech', 'mindsets'];

export const TEST_QUESTION_TYPE = ['mcq', 'text', 'code', 'rate', 'logo'];

export const FIREWALL_APPLICATION_STATUS = ['applied', 'review_pending', 'offered', 'rejected', 'joined', 'archieved'];

export const EVENT_INVITATION_STATUS = ['invited', 'rsvp', 'attended'];

export const EVENT_STATUS = ['scheduled', 'started', 'cancelled', 'aborted', 'running'];

export const BREAKOUT_TYPE = ['lecture', 'codealong', 'questionhour', 'activity', 'groupdiscussion'];

export const PING_TYPE = ['immediate', 'trigger'];

export const PING_STATUS = ['draft', 'sent', 'delivered'];

export const CHALLENGE_DIFFICULTY = ['easy', 'medium', 'difficult'];

export const CHALLENGE_SIZE = ['tiny', 'small', 'large'];

export const JOB_TYPE = ['internship', 'fulltime', 'intern2hire'];

export const JOB_POSTING_EXCLUSIVITY = ['all', 'hired', 'non-hired'];

export default {
  domain: TEST_QUESTION_DOMAIN,
  question_type: TEST_QUESTION_TYPE,
  application_status: FIREWALL_APPLICATION_STATUS,
  invite_status: EVENT_INVITATION_STATUS,
};
