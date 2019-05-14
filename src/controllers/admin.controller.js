import {getSoalToken} from '../util/token';
import User from '../models/user';

// get Access as a student with id
const switchUser = async (req, res) => {
  const {user_id} = req.params;

  try{
    const user = await User.findById(user_id).exec();
    const soalToken = getSoalToken(user);
    res.send({soalToken});
  } catch(err) {
    console.log(err)
    res.status(404).send(`User not found with id ${user_id}`);
  }
}

export default switchUser;
