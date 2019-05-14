import Express from 'express';
import {getStudentNotes, getAll, getOne, create, update, deleteOne} from '../controllers/note.controller';

const router = Express.Router();

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', deleteOne);
router.get('/student/:studentID', getStudentNotes);

export default router;
