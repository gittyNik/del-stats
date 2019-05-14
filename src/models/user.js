import mongoose from 'mongoose';
const {Schema} = mongoose;

export const USER_ROLES = {
  STUDENT: 'Student',
  EDUCATOR: 'Educator',
  SUPERADMIN: 'Superadmin',
  CATALYST: 'Catalyst',
};

export const User = mongoose.model('User', new Schema({
  name: {
    type: 'String',
    required: true
  },
  role: {
    type: 'String'
  },
  profile: Schema.Types.Mixed,

  // student specific fields
  cohorts:[{
    type: Schema.Types.ObjectId,
    ref: 'Cohort'
  }],
  currentCohort: {
    type: Schema.Types.ObjectId,
    ref: 'Cohort'
  },
  path: String,
  secret: String,

  email: {
    type: String,
  },

  // educator specific fields
  program: {type:String, default:"Exponent:Software"},
  location: {type:String, default:"Hyderabad"},
}));

// can only be used for creation logic
export class Student extends User {
  constructor(data) {
    data && (data.role = USER_ROLES.STUDENT);
    super(data);
  }
}

// can only be used for creation logic
export class Educator extends User {
  constructor(data) {
    data && (data.role = USER_ROLES.EDUCATOR);
    super(data);
  }
}

export default User;
