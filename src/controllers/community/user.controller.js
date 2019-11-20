import { apiNotReady } from '../api.controller';

export const getProfile = (req, res) => {
  res.json({ user: req.jwtData.user });
};

export const updateUser = apiNotReady;
