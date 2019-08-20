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

export const getIntentionPing = () => new Promise(async (resolve, reject) => {
  const pingData = { type: 'Intention' };
  let ping = await Ping.findOne(pingData).exec();
  if (ping !== null) {
    return resolve(ping);
  }

  ping = await new Ping(pingData).save();
  if (ping !== null) {
    return resolve(ping);
  }

  return reject();
});

export default Ping;
