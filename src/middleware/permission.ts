import { Request, Response, NextFunction } from 'express';
import httpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';

export const userPermission =
  () => (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId != parseInt(req.params.user_id)) {
      throw new wwsError(httpStatusCode.UNAUTHORIZED);
    }

    next();
  };
