import { Router } from 'express';

import validate from '../middleware/validate';
import actionValidation from '../validation/action.validation';
import { createAction } from '../controller/action.controller';
import { uploadPath } from '../config/path.config';

import multer from 'multer';
const upload = multer({ dest: uploadPath.action.capture });

const router = Router();

router.post(
  '/',
  upload.single('capture'),
  validate(actionValidation.createAction),
  createAction
);

export default router;
