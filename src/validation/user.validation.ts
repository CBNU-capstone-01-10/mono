import joi from 'joi';
import { ValidationSchema } from '../../@types/validator';
import { stringBase } from './joi/baseSchema';

const register: ValidationSchema = {
  body: joi.object().keys({
    username: stringBase.withoutSpecialChar().min(1).max(12).required(),
    email: joi.string().required().email(),
    password: joi.string().min(12).max(36).required(),
  }),
};

const login: ValidationSchema = {
  body: joi.object().keys({
    //length validation은 필요없다.
    //등록되지 않은 user는 로그인에 실패한다.
    email: joi.string().email().required(),
    password: joi.string().required(),
  }),
};

const verify: ValidationSchema = {
  query: joi.object().keys({
    user_id: joi.string().required(),
    token: joi.string().required(),
  }),
};

export default {
  register,
  login,
  verify,
};
