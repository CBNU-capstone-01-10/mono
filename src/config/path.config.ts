import path from 'path';

const to = {
  pfp: path.join('/pfp'),
  action: {
    capture: path.join('/action', 'capture'),
  },
  default: {
    pfp: path.join('/default', 'pfp'),
  },
};

const servingRootURL = new URL(process.env.SERVER_URL);

const servingURL = {
  default: {
    pfp: new URL(to.default.pfp, servingRootURL),
  },
  pfp: new URL(to.pfp, servingRootURL),
  action: {
    capture: new URL(to.action.capture, servingRootURL),
  },
};

const uploadRootPath = path.join(process.cwd(), 'uploads');

const uploadPath = {
  user: {
    pfp: path.join(uploadRootPath, to.pfp),
  },
  action: {
    capture: path.join(uploadRootPath, to.action.capture),
  },
};

export { uploadPath, servingURL, to };
