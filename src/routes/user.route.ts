import { Router } from 'express';
import validate from '../middleware/validate';
import { userValidation } from '../validation';
import { getSelf, getUser, updateUser } from '../controller/user.controller';
import upload from 'express-fileupload';
import { userPermission } from '../middleware/permission';
import coinRouter from './coin.route';

const router = Router();

// /users/self 의 'self'가 parameter로 구분되지 않도록, 먼저 위치해야함.
router.get('/self', getSelf);
router.get('/:user_id', validate(userValidation.getUser), getUser);
router.put(
  '/:user_id',
  upload({ limits: { files: 1 } }),
  validate(userValidation.updateUser),
  userPermission(),
  updateUser
);

router.use('/:user_id/coins', coinRouter);

export default router;
