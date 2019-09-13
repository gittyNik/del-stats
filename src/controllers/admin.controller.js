import faker from 'faker';
import uuid from 'uuid/v4';
import { User } from '../models/user';
import { getSoalToken } from '../util/token';

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

export default switchUser;
