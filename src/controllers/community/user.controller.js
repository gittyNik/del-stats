import { apiNotReady } from '../api.controller';
import { User } from '../../models/user';
import { updateContact } from '../../integrations/hubspot/controllers/contacts.controller';

export const getProfile = (req, res) => {
  res.json({ user: req.jwtData.user });
};

export const updateUser = apiNotReady;

export const updateProfile = (req, res) => {
  const { id } = req.jwtData.user;
  const {
    email, name, location, profile,
  } = req.body;
  updateContact(req.body).then(result => {
    User.update({
      email, name, location, profile,
    }, {
      where: { id },
      returning: true,
      raw: true,
    })
      .then(result => result[1][0])
      .then(data => {
        res.send({
          data,
          text: 'Update success',
        });
      })
      .catch(err => {
        console.error(err);
        res.sendStatus(500);
      });
  }).catch(err => {
    console.error(err);
    res.sendStatus(500);
  })
};
