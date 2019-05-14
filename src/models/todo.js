import mongoose from 'mongoose';
const {Schema} = mongoose;

export default mongoose.model('Todo', new Schema({
  text: {type:String, required:true},
  deleted: {type:Boolean, default:false},
  done: {type:Boolean, default:false},
  createTime: Date,
  color: String,
  student: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  })
)
