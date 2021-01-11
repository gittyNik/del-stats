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
import { ReviewSlots } from './review_slots';
import { AssessmentSlots } from './assessment_slots';
import { LearnerInterviews } from './learner_interviews';
import { LearnerRecruiters } from './learner_recruiter';
import { JobPosting } from './job_postings';
import { CompanyProfile } from './company_profile';
import { ShortlistedPortfolios } from './shortlisted_portfolios';
import { PaymentDetails } from './payment_details';
import { PaymentIntervals } from './payment_intervals';

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
Application.belongsTo(Program, { foreignKey: 'program_id' });

// User.hasMany(SocialConnection, {foreignKey: 'user_id'});
// SocialConnection.belongsTo(User, {foreignKey: 'user_id'})

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

BreakoutRecordings.belongsTo(User, { foreignKey: 'catalyst_id' });
BreakoutRecordingsDetails.belongsTo(User, { foreignKey: 'user_id' });

ReviewSlots.belongsTo(User, { foreignKey: 'reviewer' });
AssessmentSlots.belongsTo(User, { foreignKey: 'reviewer' });

JobApplication.hasOne(LearnerInterviews, { as: 'LearnerInterviewsDetails', foreignKey: 'job_application_id' });
LearnerInterviews.belongsTo(JobApplication, { as: 'JobApplicationDetails', foreignKey: 'job_application_id' });

User.hasOne(LearnerInterviews, { as: 'LearnerDetails', foreignKey: 'learner_id' });
LearnerInterviews.belongsTo(User, { as: 'LearnerDetails', foreignKey: 'learner_id' });

// Many to many relation between LearnerInterviews and User through LearnerRecruiter table
User.belongsToMany(LearnerInterviews, {
  through: LearnerRecruiters,
  foreignKey: 'recruiter_id',
  // otherKey: 'learner_interview_id',
  as: 'LearnerInterviews',
});
LearnerInterviews.belongsToMany(User, {
  through: LearnerRecruiters,
  // otherKey: 'learner_interview_id',
  foreignKey: 'learner_interview_id',
  as: 'Recruiters',
});

// User.hasMany()
// LearnerInterviews.belongsTo(User, {as: 'Recruiters', foreignKey: 'recruiter_ids'})
Portfolio.belongsTo(User, { foreignKey: 'learner_id' });

// User.hasOne(SocialConnection, { as: 'SocialDetails', foreignKey: 'user_id' });
// SocialConnection.belongsTo(User, { as: 'SocialDetails', foreignKey: 'user_id' });

JobApplication.belongsTo(Portfolio, { foreignKey: 'portfolio_id' });
Portfolio.hasMany(JobApplication);

JobPosting.belongsTo(CompanyProfile, { foreignKey: 'company_id' });
JobPosting.belongsTo(Challenge, { foreignKey: 'default_assignment' });
// CompanyProfile.hasMany(JobPosting);

// Challenges are now linked to job_application.
// JobPosting.belongsTo(Challenge, { foreignKey: 'attached_assignment' });
JobApplication.belongsTo(Challenge, { foreignKey: 'attached_assignment' });

JobApplication.belongsTo(JobPosting, { foreignKey: 'job_posting_id' });
JobPosting.hasMany(JobApplication);

JobApplication.hasOne(LearnerChallenge, { as: 'ApplicationChallenges', foreignKey: 'job_application_id' });
LearnerChallenge.belongsTo(JobApplication, { as: 'LearnerChallenges', foreignKey: 'job_application_id' });

// Many to many relation between CompanyProfile and Portfolio through ShortlistedLearners table
CompanyProfile.belongsToMany(Portfolio, {
  through: ShortlistedPortfolios,
  foreignKey: 'company_id',
  as: 'ShortlistedForCompanies',
});

Portfolio.belongsToMany(CompanyProfile, {
  through: ShortlistedPortfolios,
  foreignKey: 'portfolio_id',
  as: 'ShortlistedPortfoliosForCompanies',
});

PaymentDetails.hasOne(PaymentIntervals, {
  foreignKey: 'payment_details_id'
})

// PaymentIntervals.belongsTo(PaymentDetails)

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
  LearnerInterviews,
  PaymentDetails,
  PaymentIntervals
};
