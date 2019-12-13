import uuid from 'uuid/v4';
import { Challenge } from '../../models/challenge';


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
    .catch(err => console.error(err));
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
