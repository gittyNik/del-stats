import Sequelize from 'sequelize';
import 'dotenv/config';
import { getPendingApplicationCohorts } from '../../models/application';
import database from '../../database';
import { notifyApplicationReview } from './application.controller';

let application, phone;

beforeAll(() => {
  return getPendingApplicationCohorts()
    .then(applications => {
      application = applications.filter(a => a['user.email']===process.env.DEFAULT_USER)[0];
      if(application)
        phone = application['user.phone'];
    });
});

// Connection should be closed everytime models are used
afterAll(() => database.close());

it('should send sms on application offered', () => {
  if(phone)
  return notifyApplicationReview(phone, 'offered')(application).then(application => {
    expect(application).toBeDefined();
  });
  console.log('skipped the test');
});

it('should send sms on application rejected', () => {
  if(phone)
  return notifyApplicationReview(phone, 'rejected')(application).then(application => {
    expect(application).toBeDefined();
  });
  console.log('skipped the test');
});
