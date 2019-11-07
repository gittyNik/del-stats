import faker from 'faker';
import uuid from 'uuid/v4';
import { User } from '../models/user';
import { getSoalToken } from '../util/token';
import ConfigParam from '../models/config_param';

const switchUserResponse = (userPromise, res) => {
  userPromise.then((user) => {
    if (user) {
      const soalToken = getSoalToken(user);
      res.send({ user, soalToken });
    } else {
      res.status(404).send('User not found with given details');
    }
  })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

// get Access as any user with id
export const switchUser = async (req, res) => {
  const { user_id: id } = req.params;
  const userPromise = User.findByPk(id);

  switchUserResponse(userPromise, res);
};

export const switchUserByEmail = (req, res) => {
  const { email } = req.query;
  const userPromise = User.findOne({ where: { email } });

  switchUserResponse(userPromise, res);
};

export const switchToFakeUser = (req, res) => {
  const userPromise = Promise.resolve({
    id: uuid(),
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
  });

  switchUserResponse(userPromise, res);
};

export const getConfig = (req, res) => {
  ConfigParam.findAll()
  .then((data) => { res.json(data); })
  .catch(err => res.status(500).send(err));
}
export const addConfig = (req, res) => {
  const { name, value, details } = req.body;
  ConfigParam.create({
    id: uuid(),
    name,
    value,
    details,
    created_at: Date.now(),
    updated_at: Date.now(),
  })
  .then(param => res.sendStatus(201))
  .catch(err => res.status(500).send(err));
}

export const updateConfig = (req, res) => {
  const { name, value, details } = req.body;
  ConfigParam.update({ value, details }, {
    where: { name },
  })
  .then(param => res.send(param))
  .catch(err => res.status(500).send(err));
}

export default switchUser;
