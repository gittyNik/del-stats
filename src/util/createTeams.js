import faker from 'faker';
import _ from 'lodash';

export default (students, size) => _.chunk(students, size)
.map(students => ({
  teamName: faker.commerce.productName(),
  students: students.map(s => s._id),
}));
