import mongoose from 'mongoose';
const {Schema} = mongoose;
import User from "./user.js";
export default mongoose.model('Note', new Schema({
  text: {type:String, required:true},
  createdTime: Date,
  deleted: {type:Boolean, default:false},
  color: String,
  user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
  
  }));