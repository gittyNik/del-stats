import uuid from 'uuid/v4';
import { CohortBreakout } from '../../models/cohort_breakout';

export const getBreakouts = (req, res) => {
  CohortBreakout.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const createBreakout = (req, res) => {
  const {
    type, domain, topic_id,
    cohort_id, time_scheduled, duration,
    location, catalyst_id, status,
    catalyst_notes, catalyst_feedback, attendence_count,
  } = req.body;

  CohortBreakout.create({
    id: uuid(),
    type,
    domain,
    topic_id,
    cohort_id,
    time_scheduled,
    duration,
    location,
    catalyst_id,
    status,
    catalyst_notes,
    catalyst_feedback,
    attendence_count,
  })
    .then(data => {
      console.log(data);
      res.send('Breakout created');
    })
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const updateBreakout = (req, res) => {
  const {
    type, domain, topic_id,
    cohort_id, time_scheduled, duration,
    location, catalyst_id, status,
    catalyst_notes, catalyst_feedback, attendence_count,
  } = req.body;
  const { id } = req.params;

  CohortBreakout.update({
    type,
    domain,
    topic_id,
    cohort_id,
    time_scheduled,
    duration,
    location,
    catalyst_id,
    status,
    catalyst_notes,
    catalyst_feedback,
    attendence_count,
  }, {
    where: { id },
  })
    .then(() => res.send('Cohort Breakout updated.'))
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const deleteBreakout = (req, res) => {
  const { id } = req.params;

  CohortBreakout.destroy({
    where: { id },
  })
    .then(() => res.send('Deleted Cohort Breakout. '))
    .catch(err => {
      console.error(err);
      res.status(500);
    })
};