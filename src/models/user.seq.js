import Sequelize, { DataTypes } from 'sequelize';
const db = require('../database')
export const USER_ROLES = {
  STUDENT: 'Student',
  EDUCATOR: 'Educator',
  SUPERADMIN: 'Superadmin',
  CATALYST: 'Catalyst',
  SOALMATE: 'Soalmate'
};
 const User = db.define('users',{
    name:DataTypes.STRING,
    email:DataTypes.STRING,
    phone: DataTypes.STRING,
    role:DataTypes.STRING
    },{
      timestamps : false
    }
    );

User.sync({force:false}).then(function(){
  return true;
});

export default User