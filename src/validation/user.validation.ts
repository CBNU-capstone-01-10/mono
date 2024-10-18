import joi from 'joi';
import { ValidationSchema } from '../../@types/validator';

const getUser: ValidationSchema = {
  params: joi.object().keys({
    user_id: joi.number().required(),
  }),
};
// user update 데이터에 username, pfp는 모두 optional이다.
const updateUser: ValidationSchema = {
  params: joi.object().keys({
    user_id: joi.number().required(),
  }),
  body: joi.object().keys({
    username: joi.string().optional(),
    pfpToDefault: joi.boolean().optional(),
    alias: joi.string().optional(),
    address: joi.string().optional(),
  }),
};

export default {
  getUser,
  updateUser,
};
