import Sequelize from 'sequelize';
// import app from '../src/server';
import models from '../src/models';
import request from 'supertest';
import superagent from 'superagent';
import db from '../src/database';
import { getEducatorsSlackID, createChannel } from '../src/models/slack_channels';


const { Cohort, User, SlackChannel } = models;
const { PORT } = process.env;


describe('Testing slack channel creation', () => {
  // const sequelize = new Sequelize(dbConfig.test);

  beforeAll(() => {
    // connect database.
    return db
      .authenticate()
      .then(() => {
        console.log('Connection has established.');
        // return app.listen(PORT, err => {
        //   if (!err) {
        //     console.log(`Server is running on port: ${PORT}`);
        //   }
        // });
      })
      .catch(err => {
        console.log('Unable to establish connection', err);
      });
  });

  afterAll(async (done) => {
    // disconnect database.
    db.close();
    done();

  });


  test('channel name for hyd cohort', async () => {
    // volans start_date 3/30
    const cohort_id = 'adb93b83-a55a-4ec0-8da0-9c9483fc9bb3'; // volans
    const cohort = await Cohort.findByPk(cohort_id);

    let location = cohort.location.split(' ');
    location = location.length > 1 ? location[location.length - 1].slice(0, 3).toLowerCase() : location[0].slice(0, 3).toLowerCase();

    let start_date = cohort.start_date;

    let channel_name = `${cohort.name.toLowerCase()}-${location}-${start_date.getFullYear()}`
    expect(channel_name).toBe('volans-hyd-2020');

  });

  test('channel name from cohort: mumbai', async () => {
    const cohort_id = '75674b76-dabb-4e84-90ff-f129c4e834ac';

    const cohort = await Cohort.findByPk(cohort_id);

    let location = cohort.location.split(' ');
    location = location.length > 1 ? location[location.length - 1].slice(0, 3).toLowerCase() : location[0].slice(0, 3).toLowerCase();

    let start_date = cohort.start_date;
    let channel_name = `${cohort.name.toLowerCase()}-${location}-${start_date.getFullYear()}`
    expect(channel_name).toBe('columba-mum-2020');

  });

  const getChannelName = async (cohort_id) => {
    const cohort = await Cohort.findByPk(cohort_id);

    let location = cohort.location.split(' ');
    location = location.length > 1 ? location[location.length - 1].slice(0, 3) : location[0].slice(0, 3);

    let start_date = cohort.start_date;
    return `${cohort.name.toLowerCase()}-${location.toLowerCase()}-${start_date.getFullYear()}`;
  };

  test('from a function', async () => {
    const cohort_id = '75674b76-dabb-4e84-90ff-f129c4e834ac';
    let channel_name = await getChannelName(cohort_id)
    expect(channel_name).toBe('columba-mum-2020');
  });

  test('get educators from users', async () => {
    let users = await User.findAll({
      where: {
        role: 'educator'
      },
      raw: true,
    })
    console.log(users[0]);
    let email_list = users.map(user => user.email);
    console.log(email_list);

    expect(email_list.length).toBeGreaterThan(1);
  });

  test('get Slack IDs from educator channel', async () => {
    let res = await getEducatorsSlackID();
    console.log(res);
    expect(res.length).toBeGreaterThan(1);
  })

  test('Creating a Channel with team', async () => {
    const userIds = []; // list of all SlackUserId's.
    let cohort_id = '' // need to enter cohort_id
    let res = await createChannel(cohort_id, list2);
    console.log(res);

    const exp_channel_list = await superagent
      .get('https://slack.com/api/conversations.members')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
      .query(`channel=${res.id}`);
    console.log(exp_channel_list.body);
    let members = exp_channel_list.body.members;
    expect(members).arrayContaining(list2);
  });

  // test('Invite users to channel', async () => {
  //   let usersList,
  //     channel;

  //   let res = await inviteToChannel(channel, usersList);
  //   console.log(res);
  //   expect(res).toBe(usersList);

  // });

});
