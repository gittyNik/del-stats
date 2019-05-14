import mongoose from 'mongoose';
const {Schema} = mongoose;

export default mongoose.model('Cohort', new Schema({
  startDate: {type:Date, required:true},
  endDate: Date,
  name: String,
  program: {type:String, default:"Exponent:Software"},
  location: {type:String, default:"Hyderabad"},
  spotters: [{
    teamName: String,
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
  }],
}));
