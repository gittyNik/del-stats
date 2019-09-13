import faker from 'faker';
import _ from 'lodash';

export default (array, number) => {
  array = _.shuffle(array);
  let chunks = _.chunk(array, number);
  chunks = chunks.map(element => ({
    teamName: faker.fake('{{company.bsAdjective}}-{{company.bsNoun}}'),
    students: element,
  }));

  return chunks;
};
