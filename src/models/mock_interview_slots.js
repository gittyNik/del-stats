import Sequelize from 'sequelize';
import { v4 as uuid } from 'uuid';
import db from '../database';

const status = [
  'active',
  'inactive',
];

export const MockInterviewSlots = db.define('mock_interview_slots', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  created_at: {
    type: Sequelize.DATE,
    // defaultValue: Sequelize.literal('NOW()'),
  },
  updated_at: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('NOW()'),
  },
  program: {
    type: Sequelize.STRING,
  },
  cohort_duration: {
    type: Sequelize.INTEGER,
  },
  mock_interview_duration: {
    type: Sequelize.INTEGER,
  },
  mock_interview_day: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  time_scheduled: {
    type: Sequelize.TIME,
    allowNull: false,
  },
  week: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
  slot_order: {
    type: Sequelize.INTEGER,
  },
  status: {
    type: Sequelize.ENUM(...status),
    defaultValue: 'active',
  },
});

// export default MockInterviewSlots;

const weekDays = [
  {
    day: 'Tuesday',
    slot: 1,
    week: 0,
  },
  {
    day: 'Wednesday',
    slot: 2,
    week: 0,
  },
  {
    day: 'Thursday',
    slot: 3,
    week: 0,
  },
  {
    day: 'Friday',
    slot: 4,
    week: 0,
  },
  // {
  //   day: 'Saturday',
  //   slot: 5,
  //   week: 0,
  // },
  // {
  //   day: 'Sunday',
  //   slot: 6,
  //   week: 0,
  // },
  {
    day: 'Monday',
    slot: 6,
    week: 1,
  },
];

export const slotData = (cohort_duration, program) => {
  let inithours = (cohort_duration >= 26) ? 19 : 7;
  let finalHours = 22;
  let data = [];
  weekDays.map(d => {
    for (let i = inithours; i <= finalHours; i++) {
      let hr = (i < 10) ? `0${i}` : i;
      let time_scheduled = `${hr}:00:00`;
      data.push({
        id: uuid(),
        created_at: new Date(),
        updated_at: new Date(),
        program,
        cohort_duration,
        mock_interview_duration: 60 * 60 * 1000,
        mock_interview_day: d.day,
        time_scheduled,
        week: d.week,
        slot_order: d.slot,
        status: 'active',
      });
    }
  });
  return MockInterviewSlots.bulkCreate(data);
};

export const deleteSlotById = ({ id }) => MockInterviewSlots.destroy({
  where: {
    id,
  },
});

const fetchDayDetails = (day) => weekDays.filter(d => d.day === day);

export const updateSlotById = ({
  id, cohort_duration, mock_interview_day, time_scheduled, slot_status,
}) => MockInterviewSlots.update({
  cohort_duration,
  mock_interview_day,
  time_scheduled,
  status: slot_status,
  slot_order: fetchDayDetails(mock_interview_day).slot,
  week: fetchDayDetails(mock_interview_day).week,
}, {
  where: {
    id,
  },
});
