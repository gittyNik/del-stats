import { USER_ROLES } from '../../models/user';
import { User } from '../../models/user';
import uuid from 'uuid/v4';

export const addCatalyst = (req, res) => {
	const { name, email, phone } = req.body;
	User.create ({
		id: uuid(),
		name,
		email,
		phone,
		role: USER_ROLES.CATALYST
	})
	.then (data => res.json({
      text: 'Catalyst added',
      data,
    }))
    .catch((err) => {
      console.error(err);
      res.status(500);
    });

}