import uuid from 'uuid/v4';
import {
  Challenge, createAChallenge, updateAChallenge, deleteAChallenge,
  getChallengesByTopicId, getChallengesByCompanyId, getFilteredChallenges,
  getChallengeByChallengeId,

} from '../../models/challenge';
import { LearnerChallenge } from '../../models/learner_challenge';

export const getChallenges = (req, res) => {
  Challenge.findAll({})
    .then((data) => { res.json(data); })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const getChallengesByTopic = (req, res) => {
  const { id } = req.params;
  getChallengesByTopicId(id)
    .then((data) => { res.json(data); })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const getChallengesById = (req, res) => {
  const { id } = req.params;
  getChallengeByChallengeId(id)
    .then((data) => res.status(200).json({
      text: 'Challenge Details',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const getChallengesByCompany = async (req, res) => {
  const { id: company_id } = req.params;
  await getChallengesByCompanyId(company_id)
    .then(data => res.status(200).json({
      text: 'Private Challenges for a Company',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.status(500).json({
        text: 'Failed to get Private Challenges for a company',
        type: 'failure',
      });
    });
};

export const getFilteredChallengesAPI = async (req, res) => {
  const {
    path, tags, company_id,
    topic_id, difficulty, min_duration,
    max_duration,
  } = req.body;
  await getFilteredChallenges({
    path,
    tags,
    company_id,
    topic_id,
    difficulty,
    min_duration,
    max_duration,
  })
    .then(data => res.status(200).json({
      text: 'Get Challenges based on filter',
      data,
      type: 'success',
    }))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const createChallenge = (req, res) => {
  const {
    topic_id, description, starter_repo,
    difficulty, size, title, path, tags, duration, company_id,
  } = req.body;
  let user_name = req.jwtData.user.name;

  createAChallenge({
    topic_id,
    description,
    starter_repo,
    difficulty,
    size,
    title,
    path,
    tags,
    duration,
    company_id,
    user_name,
  })
    .then((data) => {
      res.send('Challenge created.');
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const updateChallenge = (req, res) => {
  const {
    topic_id, description, starter_repo,
    difficulty, size, title, path, tags, duration, company_id,
  } = req.body;
  const { id } = req.params;
  updateAChallenge({
    id,
    topic_id,
    description,
    starter_repo,
    difficulty,
    size,
    title,
    path,
    tags,
    duration,
    company_id,
  })
    .then(() => { res.send('Challenge Updated'); })
    .catch(err => {
      console.error(err);
      res.senStatus(500);
    });
};

export const deleteChallenge = (req, res) => {
  const { id } = req.params;
  deleteAChallenge(id)
    .then(() => res.send('Deleted Challenge'))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const getLearnerChallenges = (req, res) => {
  LearnerChallenge.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const createLearnerChallenge = (req, res) => {
  const {
    challenge_id, learner_id, repo, learner_feedback, review, reviewed_by,
  } = req.body;

  LearnerChallenge.create({
    id: uuid(),
    challenge_id,
    learner_id,
    repo,
    learner_feedback,
    review,
    reviewed_by,
  })
    .then(() => res.send(' Activity Challenge created'))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const updateLearnerChallenge = (req, res) => {
  const { id } = req.params;
  const {
    challenge_id, learner_id, repo, learner_feedback, review, reviewed_by,
  } = req.body;
  LearnerChallenge.update({
    challenge_id,
    learner_id,
    repo,
    learner_feedback,
    review,
    reviewed_by,
  }, {
    where: { id },
  })
    .then(() => res.send('Activity Challenge Updated'))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};

export const deleteLearnerChallenge = (req, res) => {
  const { id } = req.params;
  LearnerChallenge.destroy({
    where: { id },
  })
    .then(() => res.send('Deleted Activity Challenge'))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
};
