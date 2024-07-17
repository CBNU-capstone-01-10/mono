import { Router } from 'express';
import { login, register, verify } from '../controller/account.controller';

import { userValidation } from '../validation';
import validate from '../middleware/validate';

const router = Router();

router.post('/login', validate(userValidation.login), login);
router.post('/register', validate(userValidation.register), register);
router.get('/register/verify', validate(userValidation.verify), verify);

export default router;
