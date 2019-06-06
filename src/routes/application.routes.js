/*
GET /api/firewall/applications/             -> get lists of all applications
GET /api/firewall/applications/:id          -> get an application with given id
GET /api/firewall/applications/live/        -> get the lists of all live applications

POST /api/firewall/applications/            -> add an application
PATCH /api/firewall/applications/:id        -> update an application with given id
DELETE /api/firewall/applications/:id       -> delete an application

POST /api/firewall/applications/:id/payment -> payment process of an application
*/

import Express from 'express';
import { getAllApplication, getOneApplication, getLiveApplication, addApplication, updateApplication, deleteApplication, payment} from '../controllers/application.controller';

const router = Express.Router();

router.get('/', getAllApplication);
router.get('/:id', getOneApplication);
router.get('/live', getLiveApplication);

router.post('/', addApplication);
router.patch('/:id', updateApplication);
router.delete('/:id', deleteApplication);

router.post('/:id/payment', payment);

export default router;
