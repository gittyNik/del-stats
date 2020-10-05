import { Application } from './application';
import { Assessment } from './assessment';
import { BrowserHistoryItem } from './browser_history_items';
import { BrowserVisitItem } from './browser_visit_items';
import { Challenge } from './challenge';
import { CohortAssessment } from './cohort_assessment';
import { CohortBreakout } from './cohort_breakout';
import { Cohort } from './cohort';
import { CohortMilestone } from './cohort_milestone';
import { ConfigParam } from './config_param';
import { JobApplication } from './job_application';
import { LearnerAssessment } from './learner_assessment';
import { LearnerBreakout } from './learner_breakout';
import { LearnerChallenge } from './learner_challenge';
import { Milestone } from './milestone';
// import { Note } from './note';
import { Ping } from './ping';
import { PingTemplate } from './ping_template';
import { Pong } from './pong';
import { Portfolio } from './portfolio';
import { Program } from './program';
import { Progress } from './progress';
import { ResourceComment } from './resource_comment';
import { Resource } from './resource';
import { ResourceReport } from './resource_report';
import { ResourceVisit } from './resource_visit';
import { ResourceVote } from './resource_vote';
import { SocialConnection } from './social_connection';
import { Team } from './team';
import { Test } from './test';
import { TestQuestion } from './test_question';
// import { Todo } from './todo';
import { Topic } from './topic';
import { User } from './user';
import connection from '../database';
import { BreakoutTemplate } from './breakout_template';
import { LearnerGithubMilestones } from './learner_github_milestones';
import { LearnerGithubChallenge } from './learner_github_challenges';
import { BreakoutRecordingsDetails } from './breakout_recording_details';
import { BreakoutRecordings } from './breakout_recordings';

// TODO: describe all associations here

Application.belongsTo(User, { foreignKey: 'user_id' });

Program.hasMany(Cohort, { foreignKey: 'program_id' });
Cohort.belongsTo(Program, { foreignKey: 'program_id' });
// Cohort.hasMany(CohortMilestone, { sourceKey: 'cohort_id' });
// CohortMilestone.belongsTo(Cohort, { foreignKey: 'cohort_id' });
Cohort.hasMany(CohortBreakout, { foreignKey: 'cohort_id' });
CohortBreakout.belongsTo(Cohort);
Application.belongsTo(Cohort, { foreignKey: 'cohort_applied' });
Application.belongsTo(Cohort, { foreignKey: 'cohort_joining' });

CohortMilestone.belongsTo(Cohort, { foreignKey: 'cohort_id', constraints: false });
CohortMilestone.belongsTo(Milestone, { foreignKey: 'milestone_id', constraints: false });

CohortBreakout.belongsTo(Topic);
Topic.hasMany(CohortBreakout, { foreignKey: 'topic_id' });

Topic.belongsTo(Milestone, { foreignKey: 'milestone_id' });

CohortBreakout.belongsTo(BreakoutTemplate);
CohortBreakout.belongsTo(User, { as: 'catalyst', foreignKey: 'catalyst_id' });

LearnerBreakout.belongsTo(User, { foreignKey: 'learner_id' });
// User.hasMany(LearnerBreakout);

LearnerChallenge.belongsTo(Challenge);

Milestone.hasMany(Topic);

CohortBreakout.hasMany(LearnerBreakout, { foreignKey: 'cohort_breakout_id' });
LearnerBreakout.belongsTo(CohortBreakout);

LearnerGithubMilestones.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(LearnerGithubMilestones);

Team.belongsTo(CohortMilestone, { foreignKey: 'cohort_milestone_id' });
CohortMilestone.hasMany(Team);

CohortMilestone.belongsTo(Cohort, { foreignKey: 'cohort_id' });
Cohort.hasMany(CohortMilestone);

LearnerGithubChallenge.belongsTo(LearnerChallenge, { foreignKey: 'learner_challenge_id' });
LearnerChallenge.hasMany(LearnerGithubChallenge);

LearnerChallenge.belongsTo(User, { foreignKey: 'learner_id' });

BreakoutRecordingsDetails.belongsTo(BreakoutRecordings, { foreignKey: 'video_id' });

BreakoutTemplate.belongsTo(User, { foreignKey: 'primary_catalyst' });
// User.hasMany(LearnerChallenge);

// User.belongsTo(Cohort);
// Cohort.hasMany(User, { foreignKey: 'learners' });
// User.belongsTo(Cohort);

// Cohort.hasMany(User, { foreignKey: '' });
// User.belongsTo(Cohort);

export default {
  Application,
  Assessment,
  BrowserHistoryItem,
  BrowserVisitItem,
  Challenge,
  CohortAssessment,
  CohortBreakout,
  Cohort,
  CohortMilestone,
  ConfigParam,
  JobApplication,
  LearnerAssessment,
  LearnerBreakout,
  LearnerChallenge,
  Milestone,
  // Note,
  Ping,
  PingTemplate,
  Pong,
  Portfolio,
  Program,
  Progress,
  ResourceComment,
  Resource,
  ResourceReport,
  ResourceVisit,
  ResourceVote,
  SocialConnection,
  Team,
  Test,
  TestQuestion,
  // Todo,
  Topic,
  User,
  connection,
};
