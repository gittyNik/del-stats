import { v4 as uuid } from 'uuid';
import { USER_ROLES, User } from '../../models/user';
import logger from '../../util/logger';

export const addCatalyst = (req, res) => {
  const { name, email, phone } = req.body;
  User.create({
    id: uuid(),
    name,
    email,
    phone,
    role: USER_ROLES.CATALYST,
  })
    .then(data => res.json({
      text: 'Catalyst added',
      data,
    }))
    .catch((err) => {
      logger.error(err);
      res.status(500);
    });
};
