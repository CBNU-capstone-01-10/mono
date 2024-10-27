import { PublicUserInfo } from '../../user';

declare global {
  namespace Express {
    interface Request {
      user: PublicUserInfo;
    }
  }
}
