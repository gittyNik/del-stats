import Prompt from '../models/prompt';
import Ping from '../models/ping';
import faker from 'faker';
import _ from 'lodash';

import {promptTypes} from '../util/constants';

export const createPrompt = () => new Prompt({
  name: faker.company.catchPhrase(),
  duration: faker.random.number({
    'min': 30,
    'max': 180
  }),
  tags: [],
  type: _.sample(promptTypes),
  pings: []
}).save()

export const populatePrompt = async prompt =>{
  const pings = await Ping.aggregate([{
    $sample: {
      size: 5
    }
  }]);
  pings.forEach(ping => prompt.pings.push(ping));
  return prompt.save();
}