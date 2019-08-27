/*
  This is a simple resource routes. Customize this!!
  import {getAll} from '../controllers/resource.controller';
*/
import Express from 'express';

const {
  getAll, getOne, create, update, deleteOne,
} = require(`../controllers/${require('path').basename(__filename).split('.')[0]}`);

const router = Express.Router();

router.get('/', getAll);
router.post('/', create);
router.get('/:id', getOne);
router.patch('/:id', update);
router.delete('/:id', deleteOne);

export default router;
