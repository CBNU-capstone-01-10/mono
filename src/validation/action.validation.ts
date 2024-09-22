import joi from 'joi';
import { ValidationSchema } from '../../@types/validator';

const createAction: ValidationSchema = {
  body: joi.object().keys({
    location_x: joi.number().required(),
    location_y: joi.number().required(),
  }),
  file: joi.required(),
};

export default {
  createAction,
};
