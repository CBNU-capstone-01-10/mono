import { Router } from 'express';
import validate from '../middleware/validate';
import userValidation from '../validation/user.validation';
import { getSelf, getUser } from '../controller/user.controller';
2;

const router = Router();

// /users/self 의 'self'가 parameter로 구분되지 않도록, 먼저 위치해야함.
router.get('/self', getSelf);
router.get('/:user_id', validate(userValidation.getUser), getUser);

export default router;
