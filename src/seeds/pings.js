import Ping from '../models/ping';
import faker from 'faker';
import {pingTypes, pingKinds, questionTypes, defaultQuestionOptions} from '../util/constants';
import _ from 'lodash';

export const createPing = () => {
  const questionType = _.sample(questionTypes);
  return new Ping({
    data: {
      text: faker.hacker.phrase(),
      ...defaultQuestionOptions[questionType]
    },
    questionType,
    kind: _.sample(pingKinds),
    type: _.sample(pingTypes),
    ttl: faker.random.number({
      'min': 10,
      'max': 90
    }),
    tags: []
  }).save();
}

export const createPings = n => {
  const pings = [];
  while(n--) {
    pings.push(createPing());
  }
  return Promise.all(pings);
}
