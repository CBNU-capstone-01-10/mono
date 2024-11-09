import joi from 'joi';
import { ValidationSchema } from '../../@types/validator';

const getCoins: ValidationSchema = {
  params: joi.object().keys({
    user_id: joi.number().required(),
  }),
  query: joi.object().keys({
    date_start: joi.date().optional(),
    date_end: joi.date().optional(),
    per_page: joi.number().default(1).min(1).max(100),
    page: joi.number().default(1),
  }),
};

const addCoin: ValidationSchema = {
  params: joi.object().keys({
    user_id: joi.number().required(),
  }),
};

export default {
  getCoins,
  addCoin,
};
