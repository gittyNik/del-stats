import Express from 'express';
import {
  digioEnachWebHook,
} from '../../controllers/firewall/documents.controller';
import {
  registerUser,
  updateApplication,
} from "../../controllers/auth/register.controller";
import multer from "multer";

const upload = multer();

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

/**
 * @api {post} /firewall/webhook/user Create user
 * @apiDescription Create new user with guest role
 * @apiName CreateUser
 * @apiGroup Register
 */
router.post("/user", registerUser);

// Test Form webhook returns the data in formtype. Use multer to parse it
router.use(upload.array());

/**
 * @api {post} /firewall/webhook/application Update Application
 * @apiDescription Updates application status and hubspot contacts and deal properties
 * @apiName UpdateApplication
 * @apiGroup Register
 */

router.post("/application", updateApplication);

export default router;
