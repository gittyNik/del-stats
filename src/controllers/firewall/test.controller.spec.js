import Sequelize from 'sequelize';
import models from '../../models';
import database from '../../database';
import { populateRubric } from './test.controller';

const { Test } = models;

// Connection should be closed everytime models are used
afterAll(() => database.close());

it('should fetch rubric for a test', () => {
  return Test.findOne({
      where:{ purpose: 'think'},
      raw: true
  })
    .then(populateRubric)
    .then(test => {
      expect(test).toBeTruthy();
      expect(test.rubric).toBeTruthy();
    });
});
