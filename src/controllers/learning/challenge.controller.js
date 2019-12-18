import uuid from 'uuid/v4';
import { Challenge } from '../../models/challenge';
import { LearnerChallenge } from '../../models/learner_challenge';

export const getChallenges = (req, res) => {
  Challenge.findAll({})
    .then((data) => { res.json(data); })
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const createChallenge = (req, res) => {
  const {
    topic_id, description, starter_repo,
    difficulty, size,
  } = req.body;

  Challenge.create({
    id: uuid(),
    topic_id,
    description,
    starter_repo,
    difficulty,
    size,
  })
    .then((data) => {
      console.log(data);
      res.send('Challenge created.');
    })
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const updateChallenge = (req, res) => {
  const {
    topic_id, description, starter_repo,
    difficulty, size,
  } = req.body;
  const { id } = req.params;
  Challenge.update({
    topic_id,
    description,
    starter_repo,
    difficulty,
    size,
  }, {
    where: { id },
  })
    .then(() => { res.send('Challenge Updated'); })
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};


export const deleteChallenge = (req, res) => {
  const { id } = req.params;
  Challenge.destroy({
    where: {
      id,
    },
  })
    .then(() => res.send('Deleted Challenge'))
    .catch(err => {
      console.error(err);
      res.status(500);
    });
};

export const getLearnerChallenges = (req, res) => {
  LearnerChallenge.findAll({})
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500);
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
      console.log(err);
      res.send(500);
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
      res.status(500);
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
      res.status(500);
    });
};
