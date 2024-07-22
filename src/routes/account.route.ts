import { Router } from 'express';
import {
  login,
  register,
  verify,
  logout,
} from '../controller/account.controller';

import { userValidation } from '../validation';
import validate from '../middleware/validate';
import authMiddleware from '../middleware/auth';

const router = Router();

router.post('/login', validate(userValidation.login), login);
router.post('/register', validate(userValidation.register), register);
router.post('/register/verify', validate(userValidation.verify), verify);
router.delete('/logout', authMiddleware, logout);

export default router;
