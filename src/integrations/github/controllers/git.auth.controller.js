import { Octokit } from '@octokit/rest';

export const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

export const org = process.env.SOAL_LEARNER_ORG;
