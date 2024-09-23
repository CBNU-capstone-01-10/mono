import prismaClient from '../../src/database';
jest.unmock('../../src/database');
import request from 'supertest';
import testUserData from '../data/user.json';
import app from '../../src/app';
import redisClient from '../../src/database/clients/redis';
import session from 'express-session';
import express from 'express';
import sessionConfig from '../../src/config/session.config';
import { getPublicUserInfo } from '../../src/service/user.service';

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

describe('User API Endpoints', () => {
  beforeAll(async () => {
    for (const user of testUserData.users) {
      await prismaClient.user.create({
        data: user,
      });
    }

    await redisClient.connect();
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({});
    await redisClient.disconnect();
  });

  describe('GET', () => {
    describe('GET user', () => {
      test('Response_200_With_Public_Current_User_Info', async () => {
        const res = await request(mockApp).get(`/users/${currUser.id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toEqual(getPublicUserInfo(currUser));
      });

      test('Response_200_With_Public_User_Info', async () => {
        const user = testUserData.users[1];

        const res = await request(mockApp).get(`/users/${user.id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toEqual(getPublicUserInfo(user));
      });

      test('Response_404', async () => {
        const res = await request(mockApp).get(
          `/users/${testUserData.notFoundUserId}`
        );

        expect(res.statusCode).toEqual(404);
      });

      test('Response_400_userId(?)', async () => {
        const res = await request(mockApp)
          // string userId is invalid, userId must be number
          .get(`/users/${testUserData.invalidUserId}`);

        expect(res.statusCode).toEqual(400);
      });
    });

    describe('GET self', () => {
      test('Response_200_With_Current_User', async () => {
        const user = await prismaClient.user.findUnique({
          where: { id: currUser.id },
        });

        const res = await request(mockApp).get(`/users/self`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.encrypted_password).toEqual(user?.encrypted_password);
      });
    });
  });
});
