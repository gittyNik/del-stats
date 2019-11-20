import mongoose from 'mongoose';

const { Schema } = mongoose;

const Ping = mongoose.model('Ping', new Schema({
  data: Schema.Types.Mixed,
  tags: [],
  ttl: Number, // seconds
  type: String,
  kind: String,
  questionType: String,
}));

export default Ping;
