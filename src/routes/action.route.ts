import { Router } from 'express';

import validate from '../middleware/validate';
import minion from '../middleware/minions';
import actionValidation from '../validation/action.validation';
import { createAction } from '../controller/action.controller';

const router = Router();

router.post(
  '/',
  minion({ limits: { files: 1 } }),
  validate(actionValidation.createAction),
  createAction
);

export default router;
