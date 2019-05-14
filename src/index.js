import app from './server';
import User from './models/user';
import {createSuperAdmin} from './seeds/users';
import dbConnect from './util/dbConnect';

const {PORT, DEFAULT_USER} = process.env;

dbConnect().then( () => {

  User.findOne({ email: DEFAULT_USER }).then(async user => {
    if(user === null){
      await createSuperAdmin();
    }

    app.listen(PORT, err => {
      if (!err) {
        console.log(`Server is running on port: ${PORT}`);
      }
    });
  });

}).catch(err => console.error('MongoDB connection failure' + err));
