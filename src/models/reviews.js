import Sequelize from 'sequelize';
import uuid from 'uuid/v4';
import { over } from 'lodash';
import { CohortBreakout, BreakoutWithOptions, overlappingCatalystBreakout } from './cohort_breakout';
import { getLiveMilestones, getCohortLiveMilestones } from './cohort_milestone';
import { getTeamsbyCohortMilestoneId } from './team';
import { LearnerBreakout } from './learner_breakout';
import { getReviewSlotsByProgram } from './review_slots';
import { changeTimezone } from './breakout_template';
import { getUserByEmail, User } from './user';
import { Cohort, getCohortFromLearnerId } from './cohort';
import { sendMessageToSlackChannel } from '../integrations/slack/team-app/controllers/milestone.controller';
import { Topic } from './topic';

const GITHUB_BASE = process.env.GITHUB_TEAM_BASE;

const WEEK_VALUES = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const { gte } = Sequelize.Op;

// Start date to get all reviews - 2020-04-20
export const getAllReviews = (after_date = '2020-04-20 00:00:00+00') => CohortBreakout.findAll({
  where: {
    type: 'reviews',
    time_scheduled: { [gte]: after_date },
  },
  order: [
    ['time_scheduled', 'ASC'],
  ],
  include: [{
    model: LearnerBreakout,
    include: [{
      model: User,
      attributes: ['name'],
    }],
  }],
});

export const getReviewsById = id => CohortBreakout.findOne(
  {
    where: {
      id,
      type: 'reviews',
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [{
      model: LearnerBreakout,
      include: [{
        model: User,
        attributes: ['name'],
      }],
    }],
  },
).then(reviews => reviews);

export const getReviewsByTeam = milestone_team_id => CohortBreakout.findOne(
  {
    where: {
      type: 'reviews',
      [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [{
      model: LearnerBreakout,
      include: [{
        model: User,
        attributes: ['name'],
      }],
    }],
  },
);

export const getReviewsByStatus = status => CohortBreakout.findAll(
  {
    where: {
      status,
      type: 'reviews',
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    include: [{
      model: LearnerBreakout,
      include: [{
        model: User,
        attributes: ['name'],
      }],
    }],
    raw: true,
  },
);

export const getReviewsByUserId = learner_id => LearnerBreakout.findAll(
  {
    where: {
      learner_id,
      [Sequelize.Op.and]: Sequelize.literal("learner_review->>'type'='reviews'"),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    raw: true,
  },
);

export const getUserAndTeamReviews = (learner_id) => LearnerBreakout.findAll(
  {
    where: {
      learner_id,
      [Sequelize.Op.and]: Sequelize.literal("learner_review->>'type'='reviews'"),
    },
    order: [
      ['time_scheduled', 'ASC'],
    ],
    raw: true,
  },
);

export const getCompletedReviewsForLearner = async (email, status = 'all') => {
  try {
    const user = await getUserByEmail(email);
    const { id: learner_id } = user;
    const currentCohort = await getCohortFromLearnerId(learner_id);
    let whereObject;
    if (status === 'all') {
      whereObject = {
        learner_id,
      };
    }
    if (status === 'completed') {
      whereObject = {
        learner_id,
        [Sequelize.Op.and]: Sequelize.literal("review_feedback->>'rubrics' IS NOT NULL"),
      };
    }
    if (status === 'incomplete') {
      whereObject = {
        learner_id,
        [Sequelize.Op.and]: Sequelize.literal("review_feedback->>'rubrics' IS NULL"),
      };
    }
    const cohortBreakouts = await CohortBreakout.findAll({
      where: {
        type: {
          [Sequelize.Op.in]: ['reviews', 'assessment'],
        },
        status: 'completed',
      },
      order: [['time_scheduled', 'ASC']],
      attributes: ['id', 'details', 'type'],
      include: [
        {
          model: LearnerBreakout,
          where: whereObject,
          attributes: ['id', 'learner_id', 'attendance', 'review_feedback'],
          include: [
            {
              model: User,
              attributes: ['name', 'status'],
            },
          ],
        },
        {
          model: Cohort,
          attributes: ['id', 'name', 'type', 'location', 'duration'],
        },
        {
          model: Topic,
          attributes: ['title'],
        },
      ],
    });
    return { user, reviews: cohortBreakouts, currentCohort };
  } catch (err) {
    throw new Error(err);
  }
};

export const updateTeamReview = (
  cohort_breakout_id,
  team_feedback,
  attendance_count,
  catalyst_notes,
) => CohortBreakout.update({
  team_feedback,
  attendance_count,
  catalyst_notes,
}, {
  where: {
    id: cohort_breakout_id,
  },
  returning: true,
  raw: true,
});

export const updateReviewForLearner = (
  review_feedback,
  learner_feedback,
  id,
) => LearnerBreakout.update({
  review_feedback,
  learner_feedback,
  attendance: true,
}, {
  where: {
    id,
  },
  returning: true,
  raw: true,
});

export const createReviewEntry = (milestone_team_id, cohort_id,
  time_scheduled, duration, details, cohortName, team_feedback,
  catalyst_notes, catalyst_id) => {
  details.milestone_team_id = milestone_team_id;
  const reviewDetails = {
    cohort_id,
    time_scheduled,
    duration,
    catalyst_id,
    details,
    team_feedback,
    catalyst_notes,
    isVideoMeeting: false,
    isCodeSandbox: false,
    location: 'Online',
    cohortName,
    type: 'reviews',
    topic_id: ['760fd87b-b5af-409a-b4ba-2f7351ef82cd'], // Topic id for Deep dives
  };
  return BreakoutWithOptions(reviewDetails);
};
export const addReviewsForTeam = (milestone_team_id, learner_feedbacks, status, team_feedback,
  additional_details) => CohortBreakout.update({
  team_feedback,
  additional_details,
  status,
}, {
  where: {
    type: 'reviews',
    [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
  },
  returning: true,
  raw: true,
}).then(cohortDetails => learner_feedbacks.map(learnerFeedback => LearnerBreakout.update({
  learner_review: learnerFeedback.details,
},
{
  where: {
    id: cohortDetails.cohort_breakout_id,
    learner_id: learnerFeedback.id,
  },
  raw: true,
})));

export const updateStatusForTeam = (milestone_team_id, status) => CohortBreakout.update({
  status,
}, {
  where: {
    type: 'reviews',
    [Sequelize.Op.and]: Sequelize.literal(`details->>'milestone_team_id'='${milestone_team_id}'`),
  },
});

export const calculateReviewTime = (reviewDate, reviewForTeam) => {
  let time_split = reviewForTeam.time_scheduled.split(':');
  let scheduled_time = new Date(reviewDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

  scheduled_time.setDate(reviewDate.getDate() + (
    (
      (
        WEEK_VALUES[reviewForTeam.review_day.toLowerCase()] + 7 - reviewDate.getDay()
      ) % 7
    )
  ));

  scheduled_time.setHours(time_split[0], time_split[1], time_split[2]);

  let reviewScheduledUTC = changeTimezone(scheduled_time, 'Asia/Kolkata');
  return reviewScheduledUTC;
};

export const createTeamReviewBreakout = async (reviewSlots, cohortMilestone) => {
  let milestonecohort = cohortMilestone;
  let defaultSlot = reviewSlots[0];
  let learnerTeams = await getTeamsbyCohortMilestoneId(
    milestonecohort.id,
  );
  let count = 0;
  let overlapsResolvingAttempts = 0;
  let duration = milestonecohort['cohort.duration'];
  let cohort_duration;
  if (duration >= 26) {
    cohort_duration = 'Part-time';
  } else {
    cohort_duration = 'Full-time';
  }
  let name = milestonecohort['cohort.name'];
  let location = milestonecohort['cohort.location'];

  await Promise.all(learnerTeams.map(async (eachTeam, teamIndex) => {
    let {
      cohort_id,
      'cohort.name': cohortName,
      'milestone.name': milestoneName,
      'milestone.id': milestoneId,
      'milestone.starter_repo': milestoneRepo,
      'milestone.learning_competencies': milestoneLearningComp,
      'milestone.problem_statement': milestoneProblemStatement,
      'milestone.releases': milestoneReleases,
      'cohort.location': cohortLocation,
      'cohort.program_id': programId,
      'cohort.duration': cohortDuration,
    } = milestonecohort;

    milestoneRepo = GITHUB_BASE + milestoneRepo;
    let {
      cohort_milestone_id,
      github_repo_link,
      id,
      learners,
    } = eachTeam;

    let teamArrayId = github_repo_link.split('_');
    let teamId = teamArrayId[teamArrayId.length - 1];

    let topics = `Review for ${cohortName} Team: ${teamId}`;

    github_repo_link = GITHUB_BASE + github_repo_link;

    let details = {
      cohort_milestone_id,
      github_repo_link,
      milestoneName,
      cohortName,
      milestoneId,
      milestoneRepo,
      cohortLocation,
      programId,
      cohortDuration,
      topics,
      teamId,
      milestoneLearningComp,
      milestoneProblemStatement,
      milestoneReleases,
    };

    let indexForReview = 0;
    let reviewForTeam;

    reviewForTeam = reviewSlots[indexForReview];
    // Remove assessment that gets assigned
    reviewSlots.splice(indexForReview, 1);
    if (reviewForTeam === undefined) {
      reviewForTeam = { ...defaultSlot };
      let warning_context = `EXTRA Reviews created for ${name} ${cohort_duration} ${location} on first slot`;
      let warning_message = 'WARNING! WARNING! Extra Reviews created than available slots. Please reschedule.';
      sendMessageToSlackChannel(warning_message,
        warning_context, process.env.SLACK_PE_SCHEDULING_CHANNEL);
    }

    let timeSlot = calculateReviewTime(milestonecohort.review_scheduled, reviewForTeam);
    let { review_duration, reviewer } = reviewForTeam;

    // Logic to check for Overlapping session for Catalyst
    let endTime = new Date(timeSlot.getTime());
    endTime.setTime(endTime.getTime() + parseInt(review_duration, 10));

    // check for overlaps
    let overlaps = await overlappingCatalystBreakout({
      catalyst_id: reviewer,
      time_start: timeSlot,
      time_end: endTime,
      types: ['reviews', 'assessment'],
    });
    if (overlaps.length > 1) {
      let loopCount = 0;
      console.warn('Reviewer has breakout at this time, rescheduling');
      while (overlaps.length > 1) {
        reviewForTeam = reviewSlots[indexForReview];
        // Remove assessment that gets assigned
        reviewSlots.splice(indexForReview, 1);
        if (reviewForTeam === undefined) {
          reviewForTeam = { ...defaultSlot };
          let warning_context = `EXTRA Reviews created for ${name} ${cohort_duration} ${location} on first slot`;
          let warning_message = 'WARNING! WARNING! Extra Reviews created than available slots. Please reschedule.';
          sendMessageToSlackChannel(warning_message,
            warning_context, process.env.SLACK_PE_SCHEDULING_CHANNEL);
        }

        timeSlot = calculateReviewTime(milestonecohort.review_scheduled, reviewForTeam);
        review_duration = reviewForTeam.review_duration;
        reviewer = reviewForTeam.reviewer;

        // Logic to check for Overlapping session for Catalyst
        endTime = new Date(timeSlot.getTime());
        endTime.setTime(endTime.getTime() + parseInt(review_duration, 10));

        // check for overlaps
        // eslint-disable-next-line no-await-in-loop
        overlaps = await overlappingCatalystBreakout({
          catalyst_id: reviewer,
          time_start: timeSlot,
          time_end: endTime,
          types: ['reviews', 'assessment'],
        });

        loopCount += 1;
        if (overlaps.length === 0) {
          break;
        }
        if (loopCount === 3) {
          break;
        }
      }
      overlapsResolvingAttempts += loopCount;
    }
    count += 1;
    return createReviewEntry(
      id,
      cohort_id,
      timeSlot,
      review_duration,
      details,
      cohortName,
      null,
      null,
      reviewer,
    ).then(createReviewBreakout => {
      let cohort_breakout_id = createReviewBreakout.id;
      let review_feedback = { type: 'reviews' };
      learners.map(learner_id => LearnerBreakout.create({
        id: uuid(),
        review_feedback,
        cohort_breakout_id,
        learner_id,
      }));
      return createReviewBreakout;
    });
  }));
  let context = `Reviews created for ${name} ${cohort_duration} ${location}`;
  let message = `Created reviews for ${count} teams\n Overlap resolving attempts: ${overlapsResolvingAttempts}`;
  try {
    sendMessageToSlackChannel(message, context, process.env.SLACK_PE_SCHEDULING_CHANNEL);
  } catch (err2) {
    console.warn('Unable to send message to slack');
  }
};

export const createReviewSchedule = (program, cohort_duration) => getReviewSlotsByProgram(program,
  cohort_duration)
  .then(reviewSlots => {
    let slotsForReview = reviewSlots;
    return getLiveMilestones(program, cohort_duration)
      .then((deadlineMilestones) => {
        console.log(`Scheduling Reviews for ${deadlineMilestones.length} Cohorts`);
        deadlineMilestones.forEach(
          cohortMilestone => createTeamReviewBreakout(
            slotsForReview, cohortMilestone,
          ),
        );
      });
  });

export const createCohortReviewSchedule = (
  program,
  cohort_duration,
  cohort_id,
) => getReviewSlotsByProgram(program,
  cohort_duration)
  .then(reviewSlots => {
    let slotsForReview = reviewSlots;
    return getCohortLiveMilestones(program, cohort_duration, cohort_id)
      .then((deadlineMilestones) => {
        console.log(`Scheduling Reviews for ${deadlineMilestones.length} Cohorts`);
        deadlineMilestones.forEach(
          cohortMilestone => createTeamReviewBreakout(
            slotsForReview, cohortMilestone,
          ),
        );
      });
  });
