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
import moment from 'moment';

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
    beforeAll(async () => {
      // date_start, date_end를 test하기 위한 seed를 삽입한다.
      for (const set of Object.values(testActionData.actions)) {
        for (const action of set) {
          action.recorded_at = moment(action.recorded_at).toISOString();

          await prismaClient.action.create({
            data: action,
          });
        }
      }

      // before_m을 test하기 위한 seed를 삽입한다.
      const curr = moment();

      for (let i = 0; i < testActionData.emptyRecordedDateActions.length; i++) {
        const action = testActionData.emptyRecordedDateActions[i];

        action.recorded_at = curr.subtract(i, 'minute').toISOString();

        await prismaClient.action.create({
          data: action,
        });
      }
    });

    describe('GET Action', () => {
      test('Response_200_With_Action', async () => {
        const res = await request(mockApp).get(
          `/actions/${testActionData.actions.gap1s[0].id}`
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

    describe('GET Actions', () => {
      test('Response_200_With_Action_before_m(x)', async () => {
        const date_start = moment(testActionData.actions.gap1s[2].recorded_at);
        const date_end = moment(testActionData.actions.gap1s[5].recorded_at);

        const res = await request(mockApp).get(`/actions`).query({
          date_start: date_start.toISOString(),
          date_end: date_end.toISOString(),
        });

        expect(res.body.length).toEqual(5 - 2 + 1);
        expect(res.statusCode).toEqual(200);
      });

      test('Response_200_With_Action_date_start(x)_date_end(x)', async () => {
        const before_m = 5;

        const res = await request(mockApp).get('/actions').query({
          before_m,
        });

        expect(res.statusCode).toEqual(200);
      });
    });
  });
});
