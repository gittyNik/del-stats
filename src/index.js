import app from './server';
import User from './models/user';
import {createSuperAdmin} from './seeds/users';
import dbConnect from './util/dbConnect';
import Sequelize from 'sequelize';
const {PORT, DEFAULT_USER} = process.env;

const sequelize = new Sequelize('postgres://localhost/delta_development', {
  pool: {
    max: 5,
    acquire: 30000,
    idle: 10000,
  }
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


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
