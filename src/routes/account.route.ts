import { Router } from 'express';
import {
  login,
  register,
  verify,
  logout,
} from '../controller/account.controller';

import { accountValidation } from '../validation';
import validate from '../middleware/validate';
import authMiddleware from '../middleware/auth';

const router = Router();

router.post('/login', validate(accountValidation.login), login);
router.post('/register', validate(accountValidation.register), register);
router.post('/register/verify', validate(accountValidation.verify), verify);
router.delete('/logout', authMiddleware, logout);

export default router;
