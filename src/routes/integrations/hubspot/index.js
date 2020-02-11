import Express from 'express';
import { getContact } from '../../../integrations/hubspot/controllers/contacts.controller';

const router = Express.Router();

router.get('/contact', getContact);

export default router;