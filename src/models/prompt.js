import mongoose from 'mongoose';
const {Schema} = mongoose;

module.exports = mongoose.model('Prompt', new Schema({
  name: {
    type: String,
    required: true
  },
  duration: Number, // in Minutes
  tags: [String],
  pings: [{
    type: Schema.Types.ObjectId,
    ref: 'Ping',
  }],
  type: String,
  data: Schema.Types.Mixed
}));