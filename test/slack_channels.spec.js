import { Sequelize, Op } from 'sequelize';
// import app from '../src/server';
import models from '../src/models';
import request from 'supertest';
import superagent from 'superagent';
import db from '../src/database';
import {
  getEducatorsSlackID, createChannel, getLearnerSlackIds,
  getTeamSlackIDs, createSlackChannelRow, getChannelIdForCohort,
  beginChannel
} from '../src/models/slack_channels';
import logger from '../src/util/logger';


const { Cohort, User, SlackChannel, SocialConnection } = models;
const { PORT, SLACK_DELTA_BOT_TOKEN } = process.env;


describe('Testing slack channel creation', () => {
  // const sequelize = new Sequelize(dbConfig.test);

  beforeAll(() => {
    // connect database.
    return db
      .authenticate()
      .then(() => {
        logger.info('Connection has established.');
        // return app.listen(PORT, err => {
        //   if (!err) {
        //     logger.info(`Server is running on port: ${PORT}`);
        //   }
        // });
      })
      .catch(err => {
        logger.info('Unable to establish connection', err);
      });
  });

  afterAll(async (done) => {
    // disconnect database.
    db.close();
    done();

  });


  test('get channel name for hyd cohort', async () => {
    // volans start_date 3/30
    const cohort_id = 'adb93b83-a55a-4ec0-8da0-9c9483fc9bb3'; // volans
    const cohort = await Cohort.findByPk(cohort_id);

    let location = cohort.location.split(' ');
    location = location.length > 1 ? location[location.length - 1].slice(0, 3).toLowerCase() : location[0].slice(0, 3).toLowerCase();

    let start_date = cohort.start_date;

    let channel_name = `${cohort.name.toLowerCase()}-${location}-${start_date.getFullYear()}`;
    expect(channel_name).toBe('volans-hyd-2020');

  });

  test('get channel name from cohort: mumbai', async () => {
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

  test('get channel name from a function', async () => {
    const cohort_id = '75674b76-dabb-4e84-90ff-f129c4e834ac';
    let channel_name = await getChannelName(cohort_id);
    expect(channel_name).toBe('columba-mum-2020');
  });

  test('get educators from users', async () => {
    let users = await User.findAll({
      where: {
        role: 'educator'
      },
      raw: true,
    })
    logger.info(users[0]);
    let email_list = users.map(user => user.email);
    logger.info(email_list);
    expect(email_list.length).toBeGreaterThan(1);
  });

  test('get Slack IDs from educator channel', async () => {
    let res = await getEducatorsSlackID();
    logger.info(res);
    expect(res.length).toBeGreaterThan(1);
  })

  test.skip('Creating a Channel with team', async () => {
    const userIds = []; // list of all SlackUserId's.
    let cohort_id = '' // need to enter cohort_id
    let res = await createChannel(cohort_id, list2);
    logger.info(res);

    const exp_channel_list = await superagent
      .get('https://slack.com/api/conversations.members')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
      .query(`channel=${res.id}`);
    logger.info(exp_channel_list.body);
    let members = exp_channel_list.body.members;
    expect(members).arrayContaining(list2);
  });

  test('Get learner Slack Ids', async () => {
    expect.assertions(1);
    const cohort_id = 'bb504186-a435-4548-a171-ec89daaebb00'; //Delphinus;
    const learnerIds = await getLearnerSlackIds(cohort_id);
    logger.info(learnerIds);
    expect(learnerIds).toBeDefined();
  });

  test('getTeamSlackIds', async () => {
    expect.assertions(1);
    const res = await getTeamSlackIDs();
    logger.info(res);
    expect(res.length).toBe(15);
  });

  test('Check if list of userIds are valid', async () => {
    const cohort_id = 'bb504186-a435-4548-a171-ec89daaebb00';
    const teamIds = await getTeamSlackIDs();
    let learners = await getLearnerSlackIds(cohort_id);
    let learnerIds = learners.filter(learner => learner.username);
    learnerIds = learnerIds.map(l => l.username);
    let notRegistered = learners.filter(learner => learner.notRegisted);

    let userIds = [...teamIds, ...learnerIds];

    let usersInfo = await Promise.all(userIds.map(async (user) => {
      const userInfo = await superagent
        .post('https://slack.com/api/users.info')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Authorization', `Bearer ${SLACK_DELTA_BOT_TOKEN}`)
        .send({
          user,
        });

      if (userInfo.body.ok) {
        return {
          valid_user: user,
          type: typeof user,
        }
      }
      return { invalid_user: user, type: typeof user }
    }));
    logger.info(usersInfo);
    expect(usersInfo).toBeDefined();
  });

  // Testing whole slackChannel creation.
  test('Create slack channel for Delpinus cohort', async () => {
    const cohort_id = 'bb504186-a435-4548-a171-ec89daaebb00'; // Delphinus Hyd.
    const res = await createChannel(cohort_id);
    logger.info(res);
    expect(res).toBeDefined();
    expect(res.channel).toBeDefined();
  });

  test('Test creating a row in slack Channel', async () => {
    const cohort_id = 'bb504186-a435-4548-a171-ec89daaebb00';
    const channelId = 'GSDSTQG3H';

    const row = await createSlackChannelRow(cohort_id, channelId);
    logger.info(row);
    expect(row).toBeDefined();
  });

  test('Get cohort slack channel from cohort_id', async () => {
    const cohort_id = 'bb504186-a435-4548-a171-ec89daaebb00';
    const id = await getChannelIdForCohort(cohort_id);
    logger.info(id);
    expect(id).toBe('1234');
  });

  // jest.setTimeout(10000);
  test.only('Create slack channel route', async () => {
    expect.assertions(1);
    const cohort_id = 'bb504186-a435-4548-a171-ec89daaebb00';
    const emailList = ['technovanzed@gmail.com', 'aditya.aas.srivastava@gmail.com', 'hello@gmail.com'];
    try {


      const res = await beginChannel(cohort_id, emailList);
      logger.info(res);
      expect(res).toBeDefined();
    } catch (err) {
      logger.error(err);
    }
  }, 15000);

});
