import joi from 'joi';
import { ValidationSchema } from '../../@types/validator';

const getUser: ValidationSchema = {
  params: joi.object().keys({
    user_id: joi.number().required(),
  }),
};

export default {
  getUser,
};
