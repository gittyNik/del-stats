import express from 'express';
import { updateUser } from '../../controllers/user.controller';

const router = express.Router();

router.patch('/', updateUser);

module.exports = router;
