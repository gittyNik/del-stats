import Express from 'express';
import {
  digioEnachWebHook,
} from '../../controllers/firewall/documents.controller';

const router = Express.Router();

/**
 * DO NOT ADD AUTHENTICATION
 * @api {get} /firewall/webhook/ Digio WebHook
 * @apiDescription Digio Webhook needs no Authentication
 * @apiHeader {String} authorization JWT Token.
 * @apiName DigioWebHook
 * @apiGroup Documents
 */
router.post('/', digioEnachWebHook);

export default router;
