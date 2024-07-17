import { PublicUserInfo } from '../../user';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}
