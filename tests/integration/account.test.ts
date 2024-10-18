import prismaClient from '../../src/database';
import request from 'supertest';
import testUserData from '../data/user.json';
import app from '../../src/app';
import moment from 'moment';
import cookie from 'cookie';
import { sessionIdName } from '../../src/config/session.config';
import redisClient from '../../src/database/clients/redis';

jest.unmock('../../src/database');

jest.mock('../../src/utils/mailer.ts');

describe('Account API Endpoints', () => {
  // setup
  // seed user data를 생성한다.
  beforeAll(async () => {
    for (const user of testUserData.users) {
      await prismaClient.user.create({
        data: { ...user, pfp: { create: {} } },
      });
    }

    await redisClient.connect();
  });

  // tear down
  // - seed user data를 모두 제거한다.
  // - app를 종료한다.
  afterAll(async () => {
    await prismaClient.user.deleteMany({});
    await redisClient.disconnect();
  });

  describe('Register', () => {
    describe('POST', () => {
      // 정상적인 회원가입 요청에 대해 200을 응답받아야한다.
      test('Response_201', async () => {
        const res = await request(app)
          .post('/register')
          .send({
            username: testUserData.newUser.username,
            password: testUserData.newUser.password,
            email: testUserData.newUser.email,
            alias: testUserData.newUser.alias,
            address: testUserData.newUser.address,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          });
        expect(res.statusCode).toEqual(201);
      });

      // 이미 등록된 이메일이 포함된 회원가입 요청에 대해 409를 응답받아야한다.
      test('Response_409_Email(!)', (done) => {
        request(app)
          .post('/register')
          .send({
            username: testUserData.users[0].username,
            email: testUserData.users[0].email,
            password: 'strongPassword12!',
            alias: testUserData.newUser.alias,
            address: testUserData.newUser.address,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(409)
          .end(done);
      });

      // 사용자이름이 포함되지 않은 회원가입 요청에 대해 400을 응답받아야한다.
      test('Response_400_Username(x)', (done) => {
        request(app)
          .post('/register')
          .send({
            email: testUserData.registerInput.valid.username,
            password: testUserData.registerInput.valid.password,
            alias: testUserData.newUser.alias,
            address: testUserData.newUser.address,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      // 이메일이 포함되지 않은 회원가입 요청에 대해 400을 응답받아야한다.
      test('Response_400_Email(x)', (done) => {
        request(app)
          .post('/register')
          .send({
            username: testUserData.registerInput.valid.username,
            password: testUserData.registerInput.valid.password,
            alias: testUserData.newUser.alias,
            address: testUserData.newUser.address,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      // 비밀번호가 포함되지 않은 회원가입 요청에 대해 400을 응답받아야한다.
      test('Response_400_Password(x)', (done) => {
        request(app)
          .post('/register')
          .send({
            username: testUserData.registerInput.valid.username,
            email: testUserData.registerInput.valid.email,
            alias: testUserData.newUser.alias,
            address: testUserData.newUser.address,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      // 유효하지 않은 형식의 사용자이름이 포함된 회원가입 요청에 대해 400을 응답받아야한다.
      test('Response_400_Username(?)', (done) => {
        request(app)
          .post('/register')
          .send({
            username: testUserData.registerInput.invalid.username,
            password: testUserData.registerInput.valid.password,
            email: testUserData.registerInput.valid.email,
            alias: testUserData.newUser.alias,
            address: testUserData.newUser.address,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      // 유효하지 않은 형식의 이메일이 포함된 회원가입 요청에 대해 400을 응답받아야한다.
      test('Response_400_Email(?)', (done) => {
        request(app)
          .post('/register')
          .send({
            username: testUserData.registerInput.valid.username,
            password: testUserData.registerInput.valid.password,
            email: testUserData.registerInput.invalid.email,
            alias: testUserData.newUser.alias,
            address: testUserData.newUser.address,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      // 유효하지 않은 형식의 비밀번호가 포함된 회원가입 요청에 대해 400을 응답받아야한다.
      test('Response_400_Password(?)', (done) => {
        request(app)
          .post('/register')
          .send({
            username: testUserData.registerInput.valid.username,
            password: testUserData.registerInput.invalid.password,
            email: testUserData.registerInput.valid.email,
            alias: testUserData.newUser.alias,
            address: testUserData.newUser.address,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });
    });
  });

  describe('Verify', () => {
    describe('POST', () => {
      beforeAll(async () => {
        testUserData.expired_user.email_verification.create.expired_at =
          moment().subtract(16, 'minute').toDate().toISOString();

        await prismaClient.user.create({
          data: { ...testUserData.expired_user, pfp: { create: {} } },
        });
      });

      test('Response_200_If_Verification_Success', async () => {
        const user = await prismaClient.user.findFirst({
          where: {
            username: testUserData.newUser.username,
            email: testUserData.newUser.email,
          },
          include: {
            email_verification: true,
          },
        });

        expect(user).toBeDefined();

        const res = await request(app)
          .post(`/register/verify`)
          .send({
            user_id: user?.id,
            token: user?.email_verification?.verify_token,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          });

        expect(res.status).toEqual(200);
      });

      test('Response_200_If_Already_Verified)', async () => {
        const user = await prismaClient.user.findFirst({
          where: {
            username: testUserData.newUser.username,
            email: testUserData.newUser.email,
          },
          include: {
            email_verification: true,
          },
        });

        expect(user).toBeDefined();

        const res = await request(app)
          .post(`/register/verify`)
          .send({
            user_id: user?.id,
            token: user?.email_verification?.verify_token,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          });

        expect(res.status).toEqual(400);
      });

      test('Response_400_Token(expired)', async () => {
        const user = await prismaClient.user.findFirst({
          where: {
            username: testUserData.expired_user.username,
            email: testUserData.expired_user.email,
          },
          include: {
            email_verification: true,
          },
        });

        expect(user).toBeDefined();

        const res = await request(app).post(`/register/verify`).send({
          user_id: user?.id,
          token: user?.email_verification?.verify_token,
        });

        expect(res.status).toEqual(400);
      });

      test('Response_400_UserId(x)_Token(X)', (done) => {
        request(app).post('/register/verify').expect(400).end(done);
      });

      test('Response_404_Token(?)', (done) => {
        request(app)
          .post(`/register/verify`)
          .send({
            user_id: 1234,
            token: testUserData.verifyQuery.invalid.token,
          })
          .expect(400)
          .end(done);
      });
    });
  });

  describe('Login', () => {
    test('Redirect_To_Redirect_Uri_With_With_Sid_200', (done) => {
      request(app)
        .post('/login')
        .send({
          email: testUserData.newUser.email,
          password: testUserData.newUser.password,
        })
        .set({
          'Content-Type': 'application/x-www-form-urlencoded',
        })
        // to redirect
        .expect(200)
        .expect((res) => {
          // with sid
          const cookieStrings = res.headers['set-cookie'];
          let sidCookie = '';

          for (const cookieString of cookieStrings) {
            if (
              Object.keys(cookie.parse(cookieString)).includes(sessionIdName)
            ) {
              sidCookie = cookieString;
            }
          }

          expect(sidCookie).toBeDefined();
        })
        .end(done);
    });

    test('Response_401_Credential_Does_Not_Exist', (done) => {
      request(app)
        .post('/login')
        .send({
          // not registered credential
          email: 'doesNotExist@example.com',
          password: 'strongPassword12!',
        })
        .set({
          'Content-Type': 'application/x-www-form-urlencoded',
        })
        .expect(401)
        .end(done);
    });
  });

  describe('Logout', () => {
    const currentUser: Record<string, any> = {
      ...testUserData.users[0],
      password: 'StrongPassword12!',
    };

    beforeAll(async () => {
      const res = await request(app)
        .post('/login')
        .set({
          'Content-Type': 'application/x-www-form-urlencoded',
        })
        .send({
          email: currentUser.email,
          password: currentUser.password,
        });

      expect(res.statusCode).toEqual(200);

      const cookieStrings = res.headers['set-cookie'];
      let sidCookie = '';

      for (const cookieString of cookieStrings) {
        const _cookie = cookie.parse(cookieString);
        if (Object.keys(_cookie).includes(sessionIdName)) {
          sidCookie = cookie.serialize(sessionIdName, _cookie._dev_sid);
        }
      }

      expect(sidCookie).not.toBe('');

      currentUser.sidCookie = sidCookie;
    });

    test('Response_204', (done) => {
      request(app)
        .delete('/logout')
        .set('Cookie', currentUser.sidCookie)
        .expect(204)
        .end(done);
    });

    test('Response_409_Sid_Does_Not_Include', (done) => {
      request(app).delete('/logout').expect(401).end(done);
    });
  });
});
