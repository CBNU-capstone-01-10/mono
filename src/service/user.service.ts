import prismaClient from '../database';
import { wwsError } from '../error/wwsError';
import HttpStatusCode from 'http-status-codes';
import bcrypt from 'bcrypt';
import getRandomString from '../utils/rs';
import mailer from '../utils/mailer';
import pick from '../utils/pick';
import moment from 'moment';
import { PublicUserInfo } from '../../@types/user';

interface UserCreateInput {
  username: string;
  email: string;
  password: string;
}

interface UserLoginInput {
  email: string;
  password: string;
}

export const getUser = async (userId: number) => {
  const user = await prismaClient.user.findUnique({ where: { id: userId } });

  return user;
};

export const createUser = async (data: UserCreateInput) => {
  const registeredUser = await prismaClient.user.findFirst({
    where: { email: data.email },
    include: { email_verification: true },
  });

  if (registeredUser) {
    //이미 존재하는 user가 email verified 상태 즉, verified user.
    //409 Conflict와 함께 Conflict msg를 응답한다.
    if (registeredUser.email_verification?.email_verified) {
      throw new wwsError(
        HttpStatusCode.CONFLICT,
        'account already registered with email'
      );
    }
    //이미 존재하는 user가 email verified 되지 않은 상태
    //해당 user를 제거하고  user creation으로 넘어간다.
    else {
      const deletedUser = await prismaClient.user.delete({
        where: { id: registeredUser.id },
      });

      if (!deletedUser) {
        throw new wwsError(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          HttpStatusCode.getStatusText(HttpStatusCode.INTERNAL_SERVER_ERROR)
        );
      }
    }
  }

  //정상적인  user creation을 수행한다.
  const salt = await bcrypt.genSalt(10);

  const encrypted_password = await bcrypt.hash(data.password, salt);

  const verify_token = await bcrypt.hash(getRandomString(10), salt);

  const createdUser = await prismaClient.user.create({
    data: {
      username: data.username,
      pfp: '',
      encrypted_password,
      email: data.email,
      email_verification: {
        create: {
          verify_token,
          email_verified: false,
          expired_at: moment().add(15, 'minute').toDate(),
        },
      },
    },
  });

  await mailer.sendVerificationMail({
    verificationLink: `${process.env.SERVER_URL}/auth/signup/verify?user_id=${createdUser?.id}&token=${verify_token}`,
    dst: data.email,
  });

  return createdUser;
};

export const isExist = async (userId: number) => {
  const user = await prismaClient.user.findFirst({
    where: { id: userId },
  });

  return user ? true : false;
};

export const verifyUser = async (userId: number, verifyToken: string) => {
  const targetUser = await prismaClient.user.findFirst({
    where: {
      id: userId,
      email_verification: {
        verify_token: verifyToken,
        email_verified: false,
        expired_at: {
          gte: moment().subtract(15, 'minute').toDate(),
        },
      },
    },
  });

  if (!targetUser) {
    throw new wwsError(
      HttpStatusCode.BAD_REQUEST,
      HttpStatusCode.getStatusText(HttpStatusCode.BAD_REQUEST)
    );
  }

  await prismaClient.email_verification.update({
    data: {
      email_verified: true,
    },
    where: {
      user_id: userId,
      verify_token: verifyToken,
      email_verified: false,
    },
  });
};

export const loginUser = async (body: UserLoginInput) => {
  const user = await prismaClient.user.findFirst({
    where: {
      email: body.email,
      email_verification: {
        email_verified: true,
      },
    },
  });

  if (user) {
    if (await bcrypt.compare(body.password, user.encrypted_password)) {
      return getPublicUserInfo(user);
    }
  }

  //if user does not exist or registered incorrectly respoonse with 400
  throw new wwsError(
    HttpStatusCode.UNAUTHORIZED,
    'account does not registered'
  );
};

export const getPublicUserInfo = (user: Record<string, any>) =>
  pick(user, ['id', 'username', 'pfp', 'email']) as PublicUserInfo;
