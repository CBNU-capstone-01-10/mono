import { SessionOptions, CookieOptions } from 'express-session';

const cookieConfig: CookieOptions = {
  secure: false,
  domain: process.env.DOMAIN,
  httpOnly: true,
};

export const sessionIdName = '_dev_sid';

if (process.env.NODE_ENV === 'production') {
  cookieConfig.secure = true;
}
const sessionConfig: SessionOptions = {
  name: sessionIdName,
  secret: process.env.APP_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: cookieConfig,
};

export default sessionConfig;
