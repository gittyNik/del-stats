import mongoose from 'mongoose';

const { Schema } = mongoose;

export default mongoose.model('Day', new Schema({
  date: {
    type: Date,
    // required: true
  },
  day: {
    type: Number,
    min: 1,
    max: 500,
  },
  data: [{}],
  cohort: {
    type: Schema.Types.ObjectId,
    ref: 'Cohort',
    // required: true
  },
  phase: {
    type: String,
  },
  pairs: [{
    teamName: String,
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  }],

  timeline: [{
    prompt: {
      type: Schema.Types.ObjectId,
      ref: 'Prompt',
    },
    startTime: Date,
    data: Schema.Types.Mixed,
  }],

  pingpongs: [{
    triggerTime: Date,
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    ping: {
      type: Schema.Types.ObjectId,
      ref: 'Ping',
    },
    pong: Schema.Types.Mixed,
  }],

}, {
  collection: 'days',
}));
