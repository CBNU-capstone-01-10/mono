import prismaClient from '../../src/database';
jest.unmock('../../src/database');

import testUserData from '../data/user.json';
import testActionData from '../data/action.json';

import session from 'express-session';
import express from 'express';
import sessionConfig from '../../src/config/session.config';
import app from '../../src/app';
import redisClient from '../../src/database/clients/redis';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';

const currUser = { ...testUserData.users[0] };

const mockApp = express();

// session object가 생성되도록한다.
mockApp.use(session(sessionConfig));

// 모든 request에 대해 session object에 userId property를 지정한다.
// authentication을 수행하는 auth middleware를 우회하기 위함이다.
mockApp.all('*', (req, res, next) => {
  req.session.userId = currUser.id;
  next();
});

mockApp.use(app);

const captureImagePath = './tests/data/images/capture.png';

describe('Action API', () => {
  beforeAll(async () => {
    for (const user of testUserData.users) {
      await prismaClient.user.create({
        data: user,
      });
    }

    for (const action of testActionData.actions) {
      await prismaClient.action.create({
        data: action,
      });
    }

    await redisClient.connect();
  });

  afterAll(async () => {
    const uploadedFiles = fs.readdirSync('./uploads/action/capture');

    for (const uploadedFilePath of uploadedFiles) {
      fs.unlinkSync(path.join('./uploads/action/capture', uploadedFilePath));
    }

    await prismaClient.action.deleteMany({});
    await prismaClient.user.deleteMany({});
    await prismaClient.action.deleteMany({});
    await redisClient.disconnect();
  });

  describe('POST', () => {
    test('Response_201_With_Action', async () => {
      const res = await request(mockApp)
        .post('/actions')
        .set('Content-Type', 'multipart/form-data')
        .field('location_x', 34.6)
        .field('location_y', 32.4)
        .attach('capture', fs.createReadStream(captureImagePath));

      expect(res.statusCode).toEqual(201);
    });

    test('Response_400_Location_X(x)', async () => {
      const res = await request(mockApp)
        .post('/actions')
        .set('Content-Type', 'multipart/form-data')
        .field('location_x', 34.6)
        .attach('capture', fs.createReadStream(captureImagePath));

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_Location_Y(x)', async () => {
      const res = await request(mockApp)
        .post('/actions')
        .set('Content-Type', 'multipart/form-data')
        .field('location_y', 32.4)
        .attach('capture', fs.createReadStream(captureImagePath));

      expect(res.statusCode).toEqual(400);
    });

    test('Response_400_Capture(x)', async () => {
      const res = await request(mockApp)
        .post('/actions')
        .set('Content-Type', 'multipart/form-data')
        .field('location_x', 34.6)
        .field('location_y', 32.4);

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET', () => {
    test('Response_200_With_Action', async () => {
      const res = await request(mockApp).get(
        `/actions/${testActionData.actions[0].id}`
      );

      expect(res.statusCode).toEqual(200);
    });

    test('Response_400_ActionId(?)', async () => {
      const res = await request(mockApp).get(`/actions/actionIdMustBeString`);

      expect(res.statusCode).toEqual(400);
    });

    test('Response_404', async () => {
      const res = await request(mockApp).get(`/actions/7777777777777777`);

      expect(res.statusCode).toEqual(404);
    });
  });
});
