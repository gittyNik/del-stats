import { getAllBreakoutsInCohortMilestone, CohortBreakout, createNewBreakout } from '../../models/cohort_breakout';
import { createScheduledMeeting, deleteMeetingFromZoom } from '../../models/video_meeting';
import { createSandbox } from '../../models/code_sandbox';
import { createBreakoutsInMilestone } from '../../models/breakout_template';
import Topic from '../../models/topic';

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
    location, catalyst_id, attendance_count,
    catalyst_notes, status, catalyst_feedback,
    isVideoMeeting, isCodeSandbox,
  } = req.body;
  let time = time_scheduled.toLocaleString().split(' ').join('T');
  // console.group(time);

  if (isCodeSandbox && isVideoMeeting) {
    Promise.all([
      createSandbox(),
      createScheduledMeeting(topic_id, time, duration),
    ])
      .then(([sandbox, videoMeeting]) => {
        console.log('Sandbox Created');
        console.log('VideoMeeting Created');
        let details = {
          sandbox_id: sandbox.data.sandbox_id,
          videoMeeting_id: videoMeeting,
        };
        createNewBreakout(
          type, domain, topic_id, cohort_id, time_scheduled, duration,
          location, catalyst_id, status, catalyst_notes,
          catalyst_feedback, attendance_count, details,
        )
          .then(data => {
            console.log(data);
            res.send('Breakout Created with codesandbox and videomeeting.');
          })
          .catch(err => {
            deleteMeetingFromZoom(details.videoMeeting_id);
            console.error('Failed to create Cohort Breakout', err);
            res.send(500);
          });
      })
      .catch(err => {
        console.log('Failed to create Code Sanbdbox and Videomeeting', err);
        res.status(500);
      });
  } else if (isCodeSandbox) {
    // todo: pass template, and embedd_options as args
    createSandbox()
      .then(sandbox => {
        // console.log(data);
        let details = {
          sandbox_id: sandbox.data.sandbox_id,
        };
        createNewBreakout(
          type, domain, topic_id, cohort_id, time_scheduled, duration,
          location, catalyst_id, status, catalyst_notes,
          catalyst_feedback, attendance_count, details,
        )
          .then(data => {
            console.log('Breakout created with code sandbox only', data);
            res.send('Breakout Created with codesandbox only.');
          })
          .catch(err => {
            console.error('Failed to create Breakout', err);
            res.send(500);
          });
      })
      .catch(err => {
        console.log('Failed to create codesandbox', err);
        res.send(500);
      });
  } else if (isVideoMeeting) {
    createScheduledMeeting(topic_id, time, duration)
      .then(videoMeeting => {
        let details = {
          videoMeeting_id: videoMeeting,
        };
        createNewBreakout(
          type, domain, topic_id, cohort_id, time_scheduled, duration,
          location, catalyst_id, status, catalyst_notes,
          catalyst_feedback, attendance_count, details,
        )
          .then(data => {
            console.log(data);
            res.send('Breakout and video meeting created Created');
          })
          .catch(err => {
            deleteMeetingFromZoom(details.videoMeeting_id);
            console.error('Failed to create Breakout after creating video meeting', err);
            res.send(500);
          });
      })
      .catch(err => {
        // todo: Remove the scheduled meeting from zoom  and deltaDB - delete.
        console.log(err);
        res.send(500);
      });
  } else {
    console.log(' No Codesandbox and Videomeeting');
    res.send('Breakout created without the code-sandbox and video-meeting');
  }
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
    });
};

// http://localhost:3000/api/learning/ops/breakouts/:cohort_id/all
export const getAllCohortBreakouts = (req, res) => {
  const { cohort_id } = req.params;
  CohortBreakout.findAll({
    where: {
      cohort_id,
    },
    include: [Topic],
    raw: true,
  })
    .then(breakouts => {
      res.json({
        text: 'List of all breakouts scheduled in this cohort',
        data: breakouts,
      });
    })
    .catch(err => {
      console.error(err);
      res.json({
        text: 'Failed to get list of all breakouts in this cohort',
        data: null,
      });
    });
};

// http://localhost:3000/api/learning/ops/breakouts/:cohort_id/:milestone_id/all
export const getBreakoutsForCohortMilestone = async (req, res) => {
  const { cohort_id, milestone_id } = req.params;

  let breakouts = await getAllBreakoutsInCohortMilestone(cohort_id, milestone_id);
  console.log('RESPONSE: ', breakouts);
  breakouts = breakouts.filter(breakout => breakout != null);
  res.json({
    text: 'List of all breakouts in a cohort milestone',
    data: breakouts,
  });
};

export const createBreakouts = (req, res) => {
  let {
    cohort_id, cohort_program_id, cohort_duration,
  } = req.body;
  createBreakoutsInMilestone(cohort_id, cohort_program_id, cohort_duration).then((data) => {
    res.status(201).json({ data });
  })
    .catch(err => res.status(500).send({ err }));
};
