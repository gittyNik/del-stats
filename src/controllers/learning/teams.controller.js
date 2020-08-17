import { addLearnerToMSTeam, removeLearnerFromMSTeam, moveLearnerBetweenMSTeam } from '../../models/team';

export const addLearnerToTeamEndpoint = (req, res) => {
  const { user_id, team_id } = req.body;
  addLearnerToMSTeam(user_id, team_id)
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};

export const removeLearnerFromMSTeamEndpoint = (req, res) => {
  const { user_id, team_id } = req.body;
  removeLearnerFromMSTeam(user_id, team_id)
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};
export const moveLearnerBetweenMSTeamEndpoint = (req, res) => {
  const { user_id, current_team_id, future_team_id } = req.body;
  moveLearnerBetweenMSTeam(current_team_id, user_id, future_team_id)
    .then(data => res.json({ data }))
    .catch(err => res.status(500).send(err));
};
