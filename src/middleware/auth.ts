import { Request, Response, NextFunction } from 'express';
import httpStatusCode from 'http-status-codes';
import { wwsError } from '../error/wwsError';
import asyncCatch from '../utils/asyncCatch';
import { userService } from '../service/';

const authMiddleware = asyncCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
      const user = await userService.getUser({
        user_id: req.session.userId as number,
        isSelf: false,
      });

      if (user) {
        req.user = userService.getPublicUserInfo(user);
        return next();
      }
    }

    return next(
      new wwsError(
        httpStatusCode.UNAUTHORIZED,
        httpStatusCode.getStatusText(httpStatusCode.UNAUTHORIZED)
      )
    );
  }
);

export default authMiddleware;
