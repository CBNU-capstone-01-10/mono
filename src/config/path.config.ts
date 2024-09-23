import path from 'path';

const to = {
  user: {
    pfp: 'user/pfp/',
  },
  action: {
    capture: 'action/capture/',
  },
};

const servingRootURL = new URL(process.env.SERVER_URL);

const servingURL = {
  client: {
    pfp: new URL(to.user.pfp, servingRootURL),
  },
  action: {
    capture: new URL(to.action.capture, servingRootURL),
  },
};

const uploadRootPath = path.join(process.cwd(), 'uploads');

const uploadPath = {
  user: {
    pfp: path.join(uploadRootPath, to.user.pfp),
  },
  action: {
    capture: path.join(uploadRootPath, to.action.capture),
  },
};

export { uploadPath, servingURL };
