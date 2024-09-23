import { Router } from 'express';

import validate from '../middleware/validate';
import actionValidation from '../validation/action.validation';
import { createAction, getAction } from '../controller/action.controller';
import { uploadPath } from '../config/path.config';
import mime from 'mime';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath.action.capture);
  },
  filename: function (req, file, cb) {
    const extension = mime.extension(file.mimetype);

    if (extension) {
      cb(null, (req.session.userId as number) + Date.now() + '.' + extension);
    }
  },
});

const upload = multer({ storage });

const router = Router();

router.get('/:action_id', validate(actionValidation.getAction), getAction);
router.post(
  '/',
  upload.single('capture'),
  validate(actionValidation.createAction),
  createAction
);

export default router;
