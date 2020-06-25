import Express from 'express';
import {
  getAll, getOne, create, update, deleteOne, getGithubConnection
} from '../../controllers/community/social_connection.controller';

const router = Express.Router();

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getOne);
router.get('/github/:id', getGithubConnection);
router.patch('/:id', update);
router.delete('/:id', deleteOne);

export default router;
