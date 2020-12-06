import Sequelize from 'sequelize';
import {
  getAllBreakoutsInCohortMilestone,
  CohortBreakout,
  createNewBreakout,
  createSingleBreakoutAndLearnerBreakout,
  updateBreakoutCalendarEventForCatalyst,
  updateCohortBreakouts,
  createLearnerBreakoutsForMilestone,
  updateSanboxUrl,
  findOneCohortBreakout,
  getLearnersForCohortBreakout,

  createOrUpdateCohortBreakout,
  markBreakoutFinished,
  autoMarkAttendance,
} from '../../models/cohort_breakout';
import {
  createScheduledMeeting,
  deleteMeetingFromZoom,
  updateVideoMeeting,
  updateCohortMeeting,
} from '../../models/video_meeting';
import { createSandbox } from '../../models/code_sandbox';
import {
  BreakoutTemplate,
  createBreakoutsInMilestone,
  createTypeBreakoutsInMilestone,
} from '../../models/breakout_template';
import { Topic } from '../../models/topic';
import { CohortMilestone } from '../../models/cohort_milestone';
import { getLiveCohorts, Cohort } from '../../models/cohort';
import { User, USER_ROLES } from '../../models/user';
import { Milestone } from '../../models/milestone';
import { logger } from '../../util/logger';

const {
  between, gte,
} = Sequelize.Op;

export const createUpdateCohortBreakout = (req, res) => {
  let {
    cohort_id, topic_id, time_scheduled, catalyst_id,
  } = req.body;
  const { id: user_id, role } = req.jwtData.user;
  if (user_id === catalyst_id || role === USER_ROLES.SUPERADMIN) {
    createOrUpdateCohortBreakout(
      topic_id,
      cohort_id,
      time_scheduled,
      req.jwtData.user.name,
    )
      .then((data) => {
        res.status(201).json({
          data,
        });
      })
      .catch((err) => res.status(500).send({
        err,
      }));
  } else {
    res.status(403).send('You do not have access to this data!');
  }
};

export const autoMarkBreakoutAttendance = (req, res) => {
  let {
    breakout_id, catalyst_id,
  } = req.params;
  const { id: user_id, role } = req.jwtData.user;
  if (user_id === catalyst_id || role === USER_ROLES.SUPERADMIN) {
    autoMarkAttendance(breakout_id)
      .then((data) => {
        res.status(201).json({
          data,
        });
      })
      .catch((err) => res.status(500).send({
        err,
      }));
  } else {
    res.status(403).send('You do not have access to mark attendance for this breakout!');
  }
};

export const markCompleteBreakout = (req, res) => {
  let {
    cohort_breakout_id, catalyst_id,
  } = req.body;
  const { id: user_id, role } = req.jwtData.user;
  if (user_id === catalyst_id || role === USER_ROLES.SUPERADMIN) {
    markBreakoutFinished(cohort_breakout_id, req.jwtData.user.name)
      .then((data) => {
        res.status(201).json({
          data,
        });
      })
      .catch((err) => res.status(500).send({
        err,
      }));
  } else {
    res.status(403).send('You do not have access to this data!');
  }
};

export const getBreakouts = (req, res) => {
  CohortBreakout.findAll({})
    .then((data) => res.json(data))
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};

const populateTopics = async (breakouts) => {
  const allTopics = await Topic.findAll();
  let allTopicsIds = [];
  allTopics.map((eachTopic) => allTopicsIds.push(eachTopic.id));
  breakouts.map((breakout) => {
    let breakoutTopics = [];
    // TODO: Remove hard-code
    if (breakout.type === 'assessment') {
      breakout['breakout_template.topic_id'] = [breakout.topic_id];
      breakout.topics = [{ title: breakout.details.topics }];
    }
    if (breakout['breakout_template.topic_id'] !== null) {
      breakout['breakout_template.topic_id'].map(breakTopic => {
        let topicIndex = allTopicsIds.indexOf(breakTopic);
        breakoutTopics.push(allTopics[topicIndex]);
        return allTopics[topicIndex];
      });
      breakout.topics = breakoutTopics;
    }
    // Reviews are not associated with a particular milestone
    if (breakout.type === 'reviews') {
      breakout['topic.milestone.id'] = breakout.details.milestoneId;
      breakout['topic.milestone.name'] = breakout.details.milestoneName;
      breakout['topic.milestone.problem_statement'] = breakout.details.milestoneProblemStatement;
      breakout['topic.milestone.learning_competencies'] = breakout.details.milestoneLearningComp;
      breakout['topic.milestone.starter_repo'] = breakout.details.milestoneRepo;
      breakout['topic.milestone.releases'] = breakout.details.milestoneReleases;
      breakout['breakout_template.topic_id'] = [breakout.topic_id];
      breakout.topics = [{ title: breakout.details.topics }];
    }
    return breakout;
  });
  return breakouts;
};

export const getLiveCohortsBreakouts = (req, res) => {
  getLiveCohorts()
    .then(cohorts => {
      const cohortIds = cohorts.map(c => c.id);
      // Fetching breakouts 3 week before and plus two month
      let after_dates = new Date();
      after_dates.setDate(after_dates.getDate() - 21);
      let before_dates = new Date();
      before_dates.setDate(before_dates.getDate() + 60);
      let where = {
        cohort_id: {
          [Sequelize.Op.in]: cohortIds,
        },
        time_scheduled: { [between]: [after_dates, before_dates] },
      };
      if (req.jwtData.user.role === USER_ROLES.REVIEWER) {
        where.type = { [Sequelize.Op.in]: ['reviews', 'assessment'] };
      } else if (req.jwtData.user.role === USER_ROLES.CATALYST) {
        where.type = 'lecture';
      }
      return CohortBreakout.findAll({
        where,
        include: [
          {
            model: User,
            attributes: ['name'],
            as: 'catalyst',
          },
          Cohort,
          BreakoutTemplate,
          {
            model: Topic,
            attributes: [],
            include: [Milestone],
          },
        ],
        raw: true,
      })
        .then(populateTopics)
        .then((data) => res.json({
          text: 'Live cohort breakouts',
          data,
        }))
        .catch((err) => {
          console.error(err);
          res.status(500);
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};

export const createBreakout = (req, res) => {
  const {
    type, domain, topic_id,
    cohort_id, time_scheduled, duration,
    location, catalyst_id, attendance_count,
    catalyst_notes, catalyst_feedback,
    isVideoMeeting, isCodeSandbox, breakout_template_id,
    team_feedback, agenda, cohort_milestone_id,
    teamId, milestone_team_id, github_repo_link,
    milestone_id,
  } = req.body;
  let time = time_scheduled;
  // console.group(time);

  if (isCodeSandbox && isVideoMeeting) {
    Promise.all([
      createSandbox(),
      createScheduledMeeting(topic_id, time, duration, agenda, 2, catalyst_id),
    ])
      .then(([sandbox, videoMeeting]) => {
        // console.log('VideoMeeting Created');
        let details = {
          sandbox,
          zoom: videoMeeting,
        };

        if (type === 'reviews') {
          details.cohort_milestone_id = cohort_milestone_id;
          details.teamId = teamId;
          details.milestone_team_id = milestone_team_id;
          details.github_repo_link = github_repo_link;
          details.topics = agenda;
          details.milestoneId = milestone_id;
        } else if (type === 'assessment') {
          details.topics = agenda;
          details.milestoneId = milestone_id;
        }

        createNewBreakout(
          breakout_template_id,
          topic_id,
          cohort_id,
          time_scheduled,
          duration,
          location,
          catalyst_id,
          details,
          type,
          team_feedback,
          catalyst_notes,
          attendance_count,
          domain,
          catalyst_feedback,
        )
          .then((data) => {
            // console.log(data);
            res.status(201).json({
              message: 'Breakout, video meeting and sandbox created',
              data,
              type: 'success',
            });
          })
          .catch((err) => {
            deleteMeetingFromZoom(details.zoom.id);
            console.error('Failed to create Cohort Breakout', err);
            res.send(500).json({
              message: `Reason for error: ${err}`,
              type: 'failure',
            });
          });
      })
      .catch(err => {
        console.error('Failed to create Code Sanbdbox and Videomeeting', err);
        res.send(500).json({
          message: `Reason for error: ${err}`,
          type: 'failure',
        });
      });
  } else if (isCodeSandbox) {
    // todo: pass template, and embedd_options as args
    createSandbox()
      .then((sandbox) => {
        // console.log(data);
        let details = {
          sandbox,
        };

        if (type === 'reviews') {
          details.cohort_milestone_id = cohort_milestone_id;
          details.teamId = teamId;
          details.milestone_team_id = milestone_team_id;
          details.github_repo_link = github_repo_link;
          details.topics = agenda;
        } else if (type === 'assessment') {
          details.topics = agenda;
          details.milestoneId = milestone_id;
        }
        createNewBreakout(
          breakout_template_id,
          topic_id,
          cohort_id,
          time_scheduled,
          duration,
          location,
          catalyst_id,
          details,
          type,
          team_feedback,
          catalyst_notes,
          attendance_count,
          domain,
          catalyst_feedback,
        )
          .then(data => {
            // console.log('Breakout created with code sandbox only', data);
            res.status(201).json({
              message: 'Breakout and sandbox created',
              data,
              type: 'success',
            });
          })
          .catch((err) => {
            console.error('Failed to create Breakout', err);
            res.send(500).json({
              message: `Reason for error: ${err}`,
              type: 'failure',
            });
          });
      })
      .catch(err => {
        console.error('Failed to create codesandbox', err);
        res.send(500).json({
          message: `Reason for error: ${err}`,
          type: 'failure',
        });
      });
  } else if (isVideoMeeting) {
    createScheduledMeeting(topic_id, time, duration, agenda, 2, catalyst_id)
      .then(videoMeeting => {
        let details = {
          zoom: videoMeeting,
        };

        if (type === 'reviews') {
          details.cohort_milestone_id = cohort_milestone_id;
          details.teamId = teamId;
          details.milestone_team_id = milestone_team_id;
          details.github_repo_link = github_repo_link;
          details.topics = agenda;
          details.milestoneId = milestone_id;
        } else if (type === 'assessment') {
          details.topics = agenda;
          details.milestoneId = milestone_id;
        }
        createNewBreakout(
          breakout_template_id,
          topic_id,
          cohort_id,
          time_scheduled,
          duration,
          location,
          catalyst_id,
          details,
          type,
          team_feedback,
          catalyst_notes,
          attendance_count,
          domain,
          catalyst_feedback,
        )
          .then((data) => {
            // console.log(data);
            res.status(201).json({
              message: 'Breakout and video meeting created',
              data,
              type: 'success',
            });
          })
          .catch((err) => {
            deleteMeetingFromZoom(details.zoom.id);
            console.error(
              'Failed to create Breakout after creating video meeting',
              err,
            );
            res.send(500).json({
              message: `Reason for error: ${err}`,
              type: 'failure',
            });
          });
      })
      .catch((err) => {
        // todo: Remove the scheduled meeting from zoom  and deltaDB - delete.
        res.send(500).json({
          message: `Reason for error: ${err}`,
          type: 'failure',
        });
      });
  } else {
    let details = {
    };

    if (type === 'reviews') {
      details.cohort_milestone_id = cohort_milestone_id;
      details.teamId = teamId;
      details.milestone_team_id = milestone_team_id;
      details.github_repo_link = github_repo_link;
      details.topics = agenda;
      details.milestoneId = milestone_id;
    } else if (type === 'assessment') {
      details.topics = agenda;
      details.milestoneId = milestone_id;
    }
    createNewBreakout(
      breakout_template_id,
      topic_id,
      cohort_id,
      time_scheduled,
      duration,
      location,
      catalyst_id,
      details,
      type,
      team_feedback,
      catalyst_notes,
      attendance_count,
      domain,
      catalyst_feedback,
    )
      .then((data) => {
        // console.log(data);
        res.status(201).json({
          message: 'Breakout created',
          data,
          type: 'success',
        });
      })
      .catch((err) => {
        console.error(
          'Failed to create Breakout after creating video meeting',
          err,
        );
        res.send(500).json({
          message: `Reason for error: ${err}`,
          type: 'failure',
        });
      });
  }
};

export const updateBreakout = (req, res) => {
  const {
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
  } = req.body;
  const user_id = req.jwtData.user.id;
  const { id } = req.params;

  CohortBreakout.update(
    {
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
      updated_by: [user_id],
    },
    {
      where: { id },
    },
  )
    .then(() => res.send('Cohort Breakout updated.'))
    .catch((err) => {
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
    .catch((err) => {
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
    include: [
      Topic,
      {
        model: User,
        attributes: ['name'],
        as: 'catalyst',
      },
    ],
    raw: true,
  })
    .then((breakouts) => {
      breakouts.map((breakout) => {
        if (breakout.type === 'reviews') {
          breakout['topic.milestone_id'] = breakout.details.milestoneId;
        }
        return breakout;
      });
      res.json({
        text: 'List of all breakouts scheduled in this cohort',
        data: breakouts,
      });
    })
    .catch((err) => {
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
  // console.log('RESPONSE: ', breakouts);
  breakouts = breakouts.filter(breakout => breakout != null);
  res.json({
    text: 'List of all breakouts in a cohort milestone',
    data: breakouts,
  });
};

export const createBreakoutsOfType = (req, res) => {
  let {
    cohort_id,
    cohort_program_id,
    cohort_duration,
    type,
    code_sandbox,
    video_meet,
  } = req.body;
  createTypeBreakoutsInMilestone(
    cohort_id,
    cohort_program_id,
    cohort_duration,
    type,
    code_sandbox,
    video_meet,
  )
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch(err => res.status(500).send({ err }));
};

export const createBreakouts = (req, res) => {
  let { cohort_id, cohort_program_id, cohort_duration } = req.body;
  createBreakoutsInMilestone(cohort_id, cohort_program_id, cohort_duration)
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch((err) => res.status(500).send({ err }));
};

export const createSingleBreakout = (req, res) => {
  let {
    topic_id, breakout_duration, time_scheduled, agenda, catalyst_id,
  } = req.body;
  const { id: cohort_id } = req.params;
  createSingleBreakoutAndLearnerBreakout(cohort_id, topic_id,
    breakout_duration, time_scheduled, agenda, catalyst_id).then((data) => {
    res.status(201).json({ data });
  })
    .catch(err => res.status(500).send({ err }));
};

export const updateZoomMeeting = (req, res) => {
  let { updated_time } = req.body;
  const { id: zoom_meeting_id } = req.params;
  updateVideoMeeting(zoom_meeting_id, updated_time).then((data) => {
    if (data) {
      res.status(200).json({ message: 'Zoom meeting updated with time' });
    }
    res.status(400).json({ message: 'Zoom meeting not updated' });
  });
};

/**
 *  updateCohortBreakout -> can either update time_scheduled, catalyst or both
 * These changes need to be done for each update.
 * 1. update/create zoom meeting.
 * 2. update/create calendarevent for Catalyst
 * 3. create/update calendar event for all learners in that cohort.
 * 4. todo: update only for learners of a certain path (backend/frontend).
 */
export const updateCohortBreakout = async (req, res) => {
  const { updated_time, catalyst_id: newCatalystId } = req.body;
  const { id } = req.params;
  try {
    let cohort_breakout = await findOneCohortBreakout({ id })
      .then(_cohortBreakout => _cohortBreakout.get({ plain: true }))
      .catch(err => {
        logger.error(err);
        res.status(500).json([err.name, err.message]);
      });
    const { details, catalyst_id, time_scheduled: oldTime } = cohort_breakout;

    let zoomDetails;
    const updatedZoomDetails = await updateCohortMeeting(id, updated_time, newCatalystId);

    if (typeof updatedZoomDetails.error !== 'undefined') {
      zoomDetails = updatedZoomDetails.error;
    }
    zoomDetails = updatedZoomDetails.zoom;

    let catalystCalendarEvent = await updateBreakoutCalendarEventForCatalyst({
      cohort_breakout,
      updated_time,
      catalyst_id: newCatalystId,
    });

    details.zoom = zoomDetails;
    details.catalystCalendarEvent = catalystCalendarEvent;
    let whereObject;

    if (cohort_breakout.type === 'lecture') {
      whereObject = {
        topic_id: cohort_breakout.topic_id,
        time_scheduled: cohort_breakout.time_scheduled,
        type: 'lecture',
      };
    } else {
      whereObject = { id };
    }

    const updatedCohortBreakout = await updateCohortBreakouts({
      updateObject: {
        time_scheduled: updated_time || oldTime,
        catalyst_id: newCatalystId || catalyst_id,
        details,
      },
      whereObject,
    })
      .then(_cb => _cb[0])
      .catch(err => {
        console.error('Failed to update CohortBreakout');
        console.error(err);
        res.status(500).json([err.name, err.message]);
      });
    // const learnerBreakoutEvents = await updateCalendarEventInLearnerBreakout(id);
    res.status(201).json({
      updatedCohortBreakout,
      // learnerBreakoutEvents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json([err.name, err.message]);
  }
};

export const calculateAfterDays = (previousTime, afterDays) => {
  // Shallow copy datetime object
  const RELEASE_TIME = new Date(previousTime.toLocaleString('en-US'));
  let updatedTime = RELEASE_TIME;

  updatedTime.setDate(RELEASE_TIME.getDate() + afterDays);
  return updatedTime;
};

// TODO: Make this transactional, if one fails, all should revert
export const updateMilestoneByDays = async (cohortId, updateByDays, user_id = null) => {
  let currentDateTime = new Date();
  await CohortMilestone.findAll({
    where: {
      cohort_id: cohortId,
      release_time: { [gte]: Date.now() },
    },
    attributes: ['id', 'release_time', 'review_scheduled'],
    raw: true,
  }).then(cohortMilestones => {
    // console.log('Updating Milestone timings');
    Promise.all(cohortMilestones.map(cohortMilestone => {
      // Calculating Milestone start and end time
      let updatedReleaseTime = calculateAfterDays(cohortMilestone.release_time, updateByDays);
      let updatedReviewScheduled = calculateAfterDays(cohortMilestone.review_scheduled,
        updateByDays);
      console.debug(`Previous meeting time ${cohortMilestone.release_time}`);
      console.debug(`Updated meeting time ${updatedReleaseTime}`);

      if (updatedReviewScheduled > currentDateTime) {
        CohortMilestone.update(
          {
            release_time: updatedReleaseTime,
            review_scheduled: updatedReviewScheduled,
          },
          {
            where: {
              id: cohortMilestone.id,
            },
          },
        );
      }
    }));
  });
  await CohortBreakout.findAll({
    attributes: ['id', 'time_scheduled', 'details'],
    where: {
      cohort_id: cohortId,
      type: 'lecture',
      status: 'scheduled',
    },
  }).then((cohortBreakouts) => Promise.all(
    cohortBreakouts.map((cohortBreakout) => {
      let updatedScheduledTime = calculateAfterDays(
        cohortBreakout.time_scheduled,
        updateByDays,
      );
      if (updatedScheduledTime > currentDateTime) {
        let zoomMeetingId;
        if ('zoom' in cohortBreakout.details) {
          zoomMeetingId = cohortBreakout.details.zoom.id;
        }
        // Update breakout time and Zoom meeting
        return CohortBreakout.update(
          {
            time_scheduled: updatedScheduledTime,
            updated_by: [user_id],
          },
          {
            where: {
              id: cohortBreakout.id,
            },
          },
        ).then(() => {
          if (zoomMeetingId !== undefined) {
            return updateVideoMeeting(zoomMeetingId, updatedScheduledTime);
          }
          return 'Update breakout';
        });
      }
      return null;
    }),
  ));
  return { message: 'Update Milestones and breakouts' };
};

export const updateMilestonesBreakoutTimelines = async (req, res) => {
  let { updated_time } = req.body;
  const { id: cohort_id } = req.params;
  const user_id = req.jwtData.user.id;
  await updateMilestoneByDays(cohort_id, updated_time, user_id)
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ err });
    });
};

export const createCohortMilestoneLearnerBreakouts = async (req, res) => {
  let {
    id: cohort_milestone_id,
  } = req.params;
  await createLearnerBreakoutsForMilestone(cohort_milestone_id)
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ err });
    });
};

export const updateSanboxDetails = async (req, res) => {
  let {
    id,
  } = req.params;
  let {
    sandbox_id, url,
  } = req.body;
  await updateSanboxUrl(id, sandbox_id, url)
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ err });
    });
};

// Update Learners attched to a breakout for attendance
// Does not support reviews and assessments
export const validateAttendanceForBreakout = async (req, res) => {
  let {
    id,
  } = req.params;
  let cohortBreakout = await CohortBreakout.findByPk(id, {
    attributes: ['topic_id', 'cohort_id', 'type', 'status'],
    raw: true,
  });
  await getLearnersForCohortBreakout(cohortBreakout.topic_id,
    cohortBreakout.cohort_id, id, cohortBreakout.status, cohortBreakout.type)
    .then((data) => {
      res.status(201).json({ data });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ err });
    });
};
