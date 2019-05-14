import mongoose from 'mongoose';
const {Schema} = mongoose;

const Link = mongoose.model('Link', new Schema({
  data:Schema.Types.Mixed,
  url: String
}));

export default Link;
