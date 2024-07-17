import joi from 'joi';
import httpStatusCode from 'http-status-codes';
import pick from '../utils/pick';
import { wwsError } from '../error/wwsError';
import { NextFunction, Request, Response } from 'express';
import { ValidationSchema } from '../../@types/validator';
import asyncCatch from '../utils/asyncCatch';

const validate = (validationSchema: ValidationSchema) =>
  asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
    //get validate target object from req object
    const object = pick(
      req,
      Object.keys(validationSchema) as Array<keyof ValidationSchema>
    );

    //validation object with validatioSchema
    const { error } = joi
      .compile(validationSchema)
      .prefs({ errors: { label: 'key' }, abortEarly: false })
      .validate(object);

    //if invalid, response error message with 400
    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(', ');

      return next(new wwsError(httpStatusCode.BAD_REQUEST, errorMessage));
    }

    //next
    return next();
  });

export default validate;
