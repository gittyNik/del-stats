import Express from 'express';
import { getContact } from '../../../integrations/hubspot/controllers/contacts.controller';
import { getDealById } from '../../../integrations/hubspot/controllers/deals.controller';

const router = Express.Router();

router.get('/contact', getContact);
router.get('/deal', getDealById);

export default router;
