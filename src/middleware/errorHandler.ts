import { wwsError } from '../error/wwsError';
import { NextFunction, Request, Response } from 'express';

const errorHandler = (
  err: wwsError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //logging system error
  if (err.originError) {
    const originError = err.originError;

    console.log(originError);
  }

  return res.status(err.status).json({
    status: err.status,
    statusText: err.statusText,
    message: err.message,
  });
};

export default errorHandler;
