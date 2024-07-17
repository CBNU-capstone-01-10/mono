import path from 'path';

const to = {
  client: {
    logo: 'client/logo/',
  },
};

const servingRootURL = new URL(process.env.SERVER_URL);

const servingURL = {
  client: {
    logo: new URL(to.client.logo, servingRootURL),
  },
};

const uploadRootPath = path.join(process.cwd(), 'uploads');

const uploadPath = {
  client: {
    logo: path.join(uploadRootPath, to.client.logo),
  },
};

export { uploadPath, servingURL };
