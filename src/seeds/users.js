import faker from 'faker';
import {default as User, USER_ROLES} from '../models/user';
import {paths} from '../util/constants';
import _ from 'lodash';

export const createSuperAdmin = () => new User({
  name: faker.name.findName(),
  role: USER_ROLES.SUPERADMIN,
  email: process.env.DEFAULT_USER,
}).save()


export const createStudent = (currentCohortId) => new User({
  name: faker.name.findName(),
  role: USER_ROLES.STUDENT,
  cohorts: [currentCohortId],
  currentCohort: currentCohortId,
  email: faker.internet.email(),
  path: _.sample(paths),
}).save()
