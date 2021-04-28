import Express from 'express';
import moment from 'moment';
import { getLiveCohorts } from '../../../../models/cohort';
import { createChannel } from '../controllers/channel.controller';
import oauth2Route from './oauth.route';

const router = Express.Router();

export const getCohortFormattedId = ({ data, program_type }) => data.filter(
  e => e.program_id === program_type,
).map(
  e => `${e.name}-${e.type}-${e.duration === 26 ? 'ft' : ''}${e.duration === 16 ? 'pt' : ''}-${moment(e.start_date).format('MMM')}-${moment(e.start_date).format('YY')}`,
);

router.get('/', async (req, res) => {
  const data = await getLiveCohorts();
  const reqData = getCohortFormattedId({ data, program_type: 'tep' });
  const ayy = await createChannel({ guild_id: process.env.DISCORD_GUILD_ID, name: 'name', options: { type: 'text' } });
  return res.send({ ayy });
});

router.use('/oauth', oauth2Route);

export default router;
