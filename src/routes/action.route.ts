import { Router } from 'express';

import validate from '../middleware/validate';
import actionValidation from '../validation/action.validation';
import {
  createAction,
  getAction,
  getActions,
  getScoreSum,
} from '../controller/action.controller';
import upload from 'express-fileupload';

const router = Router();

router.get('/', validate(actionValidation.getActions), getActions);
router.get('/:action_id', validate(actionValidation.getAction), getAction);
router.post(
  '/',
  upload({ limits: { files: 1 } }),
  validate(actionValidation.createAction),
  createAction
);

router.get('/scores/sum', validate(actionValidation.getScoreSum), getScoreSum);

export default router;
