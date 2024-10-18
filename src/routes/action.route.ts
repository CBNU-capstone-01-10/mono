import { Router } from 'express';

import validate from '../middleware/validate';
import actionValidation from '../validation/action.validation';
import {
  createAction,
  getAction,
  getActions,
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

export default router;
