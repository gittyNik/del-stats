import {getSoalToken} from '../util/token';
import User from '../models/user';

const switchUserResponse = (userPromise, res) => {
  userPromise.then(user => {
    if(user) {
      const soalToken = getSoalToken(user);
      res.send({user, soalToken});
    } else {
      res.status(404).send('User not found with given details');
    }
  })
  .catch(err => {
    console.error(err);
    res.sendStatus(500);
  });
}

// get Access as any user with id
export const switchUser = async (req, res) => {
  const {user_id} = req.params;
  const userPromise = User.findByPk(user_id);

  switchUserResponse(userPromise, res);
}

export const switchUserByEmail = (req, res) => {
  const {email} = req.query;
  const userPromise = User.findOne({where: {email}});

  switchUserResponse(userPromise, res);
}

export default switchUser;
