import uuid from 'uuid/v4';
import faker from 'faker';
import _ from 'lodash';

const queTypes = ['mcq', 'text', 'code', 'rate', 'logo'];
const getRandomQueDomain = () => _.sample(['generic', 'mindsets', 'tech']);

const generateTestQuestion = (type) => {
  const testQuestion = {
    id: uuid(),
    type,
    question: {
      question: faker.lorem.sentence(),
      image: faker.image.imageUrl(),
    },
    domain: getRandomQueDomain(),
    answer: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const getOptions = count => (_.times(count, () => ({
    option: faker.lorem.sentence(),
    image: faker.image.imageUrl(),
  })));

  switch (type) {
    case 'rate': {
      const maxRating = 10;
      Object.assign(testQuestion.question, { maxRating });
      return Object.assign(testQuestion, {
        answer: {
          rating: _.random(maxRating),
        },
      });
    }
    case 'code':
    case 'logo':
      return Object.assign(testQuestion, {
        domain: 'tech',
      });
    case 'mcq': {
      const optionsCount = 4;
      Object.assign(testQuestion.question, {
        options: getOptions(optionsCount),
        allowMultiple: _.sample([true, false]),
      });

      const options = new Set([_.random(optionsCount)]);
      if (testQuestion.allowMultiple) {
        options.add(_.random(optionsCount));
        options.add(_.random(optionsCount));
      }

      return Object.assign(testQuestion, {
        answer: {
          options: [...options],
        },
      });
    }
    case 'text':
    default:
      return testQuestion;
  }
};

// ensure questions of every type is included
const questions = [..._.times(100, () => _.sample(queTypes)), ...queTypes]
  .map(generateTestQuestion);

const seeder = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('test_questions', questions, {}, {
    question: { type: new Sequelize.JSON() },
    answer: { type: new Sequelize.JSON() },
  }),

  down: queryInterface => queryInterface.bulkDelete('test_questions', null, {}),
};

export default seeder;
