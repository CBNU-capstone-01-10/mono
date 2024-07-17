import { wwsError } from '../error/wwsError';
import { Request, Response } from 'express';

const errorHandler = (err: wwsError, req: Request, res: Response) => {
  console.log(err);

  //logging system error
  if (err.originError) {
    const originError = err.originError;

    console.error(originError);
  }

  return res.status(err.status).json({
    status: err.status,
    statusText: err.statusText,
    message: err.message,
  });
};

export default errorHandler;
