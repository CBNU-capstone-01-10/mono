import joi from 'joi';
import { ValidationSchema } from '../../@types/validator';

const createAction: ValidationSchema = {
  body: joi.object().keys({
    location_x: joi.number().required(),
    location_y: joi.number().required(),
  }),
  files: joi.object().required().keys({
    capture: joi.object().required(),
  }),
};

const getAction: ValidationSchema = {
  params: joi.object().keys({
    action_id: joi.number().required(),
  }),
};

const getActions: ValidationSchema = {
  query: joi.object().keys({
    date_start: joi.date().optional(),
    date_end: joi.date().optional(),
    before_m: joi.number().optional(),
    per_page: joi.number().default(1).min(1).max(100),
    page: joi.number().default(1),
  }),
};

export default {
  createAction,
  getAction,
  getActions,
};
