import moment from 'moment';
import 'moment-timezone';

const WEEK_VALUES = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const zone = 'Asia/Kolkata';

// Need to change this to use moment
export const changeTimezone = (date, ianatz) => {
  // suppose the date is 02:30 UTC
  let invdate = new Date(date.toLocaleString('en-US', {
    timeZone: ianatz,
  }));

  // then invdate will be 08:00pm in India
  // and the diff is 5:30 hours
  let diff = date.getTime() - invdate.getTime();

  // so 08:00pm in India is 02:30 UTC
  return new Date(date.getTime() + diff);
};

export const calculateAfterDays = (previousTime, afterDays) => {
  // Shallow copy datetime object
  const RELEASE_TIME = moment(previousTime);
  let updatedTime = RELEASE_TIME.clone();

  updatedTime = RELEASE_TIME.add(afterDays, 'days');
  return updatedTime;
};

export const calculateScheduleTime = ({
  review_date, time_scheduled, slot_day, slot_week,
}) => {
  slot_week = slot_week || 0;
  let time_to_schedule = moment(time_scheduled, 'HH:mm:ss');
  // Removing timezone if present from the date
  let scheduled_time = moment(moment(review_date).format('YYYY-MM-DDTHH:mm:ss'));

  const dayINeed = WEEK_VALUES[slot_day.toLowerCase()];

  // const today = moment().isoWeekday();
  // If past date, get next week
  // if (today <= dayINeed) {
  //   slot_week = 1;
  // }

  // for reviews/assessment the week starts from Tuesday and ends on Monday of next week
  let updatedDate = moment(scheduled_time).add(slot_week, 'weeks').isoWeekday(dayINeed);

  updatedDate.set({
    hour: time_to_schedule.get('hour'),
    minute: time_to_schedule.get('minute'),
    second: time_to_schedule.get('second'),
  });

  // TimeZone should ideally come from env or DB

  const assessmentScheduledUTC = moment(updatedDate).tz(zone, true).utc();

  let twoWeeksAhead = moment(review_date).add(2, 'weeks');
  if (assessmentScheduledUTC > twoWeeksAhead) {
    throw Error('Review/Assessment scheduled too much in the future!');
  }

  return assessmentScheduledUTC;
};

export const calculateBreakoutTime = ({
  time_scheduled, after_days, release_time, duration,
}) => {
  // Shallow copy datetime object
  const RELEASE_TIME = moment(moment(release_time).format('YYYY-MM-DDTHH:mm:ss'));
  let breakoutScheduledTime = RELEASE_TIME.clone();
  let time_to_schedule = moment(time_scheduled, 'HH:mm:ss');

  breakoutScheduledTime = RELEASE_TIME.add(after_days, 'days');
  breakoutScheduledTime.set({
    hour: time_to_schedule.get('hour'),
    minute: time_to_schedule.get('minute'),
    second: time_to_schedule.get('second'),
  });
  // TimeZone should ideally come from env or DB
  const breakoutScheduledUTC = moment(breakoutScheduledTime).tz(zone, true).utc();

  let breakoutSchedule = { breakout_schedule: breakoutScheduledUTC };
  return breakoutSchedule;
};
