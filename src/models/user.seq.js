import Sequelize, { DataTypes } from 'sequelize';
const db = require('../database')
export const USER_ROLES = {
  STUDENT: 'Student',
  EDUCATOR: 'Educator',
  SUPERADMIN: 'Superadmin',
  CATALYST: 'Catalyst',
  SOALMATE: 'Soalmate'
};
 const User = db.define('Users',{
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    role: DataTypes.STRING,
    location: DataTypes.STRING,
    profile: DataTypes.ARRAY(DataTypes.JSON)
    },{
      timestamps : false
    }
    );

User.sync({force:false}).then(function(){
  return true;
});

export default User