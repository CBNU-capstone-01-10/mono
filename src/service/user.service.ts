import prismaClient from '../database';
import { wwsError } from '../error/wwsError';
import HttpStatusCode from 'http-status-codes';
import bcrypt from 'bcrypt';
import mailer from '../utils/mailer';
import pick from '../utils/pick';
import moment from 'moment';
import {
  PublicUserInfo,
  UserGetInput,
  UserUpdateInput,
} from '../../@types/user';
import { Request } from 'express';
import otpGenerator from 'otp-generator';
import httpStatusCode from 'http-status-codes';
import { Prisma } from '@prisma/client';
import fs from 'node:fs';
import { to, uploadPath } from '../config/path.config';
import path from 'node:path';

interface UserCreateInput {
  username: string;
  email: string;
  password: string;
}

interface UserLoginInput {
  email: string;
  password: string;
}

export const getUser = async (data: UserGetInput) => {
  const user = await prismaClient.user.findUnique({
    where: { id: data.user_id },
    include: { pfp: true },
  });

  if (!user) {
    throw new wwsError(httpStatusCode.NOT_FOUND, '사용자를 찾을 수 없습니다.');
  }

  if (data.isSelf) {
    return user;
  }

  return getPublicUserInfo(user);
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

      // 이미 존재하는 user가 email verified 되지 않은 상태여서 제거했는데
      // 제거되지 않았다면, 잘못된 동작
      if (!deletedUser) {
        throw new wwsError(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          HttpStatusCode.getStatusText(HttpStatusCode.INTERNAL_SERVER_ERROR)
        );
      }
    }
  }

  //정상적인 user creation을 수행한다.
  const salt = await bcrypt.genSalt(10);

  const encrypted_password = await bcrypt.hash(data.password, salt);

  const verify_token = otpGenerator.generate(8, {
    upperCaseAlphabets: true,
  });

  const createdUser = await prismaClient.user.create({
    data: {
      username: data.username,
      pfp: { create: {} },
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
    include: {
      pfp: true,
    },
  });

  await mailer.sendVerificationMail({
    token: verify_token,
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
    include: {
      pfp: true,
    },
  });

  if (user) {
    if (await bcrypt.compare(body.password, user.encrypted_password)) {
      return user;
    }
  }

  //if user does not exist or registered incorrectly respoonse with 400
  throw new wwsError(
    HttpStatusCode.UNAUTHORIZED,
    'account does not registered'
  );
};

export const logoutUser = (req: Request) => {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) {
        // internal server error가 응답될 거다.
        reject(err);
      }
    });

    resolve(undefined);
  });
};

export const getPublicUserInfo = (user: Record<string, any>) =>
  pick(user, ['id', 'username', 'pfp', 'email']) as PublicUserInfo;

export async function updateUser(userId: number, data: UserUpdateInput) {
  const _data: Prisma.userUpdateInput = {};

  const user = await prismaClient.user.findFirst({
    where: { id: userId },
    include: { pfp: true },
  });

  // 아무것도 전달되지 않았다면, 업데이트 되지 않은 user 그대로를 return한다.
  if (!data.username && !data.pfpToDefault && !data.pfp) {
    return user;
  }

  // username이 전달되었다면, 추가
  if (data.username) {
    _data.username = data.username;
  }

  // pfp를 default나 새로운 image로 변경하려고할 때,user의 pfp가 default가 아니라면 제거한다.
  if (data.pfpToDefault || data.pfp) {
    if (!user!.pfp!.is_default) {
      fs.unlinkSync(path.join(uploadPath.user.pfp, `${userId}.png`));
    }
  }
  // default로 변경하려고한다면
  if (data.pfpToDefault) {
    // 이미 default가 아니라면
    if (!user!.pfp!.is_default) {
      const pfpPath = path.join(to.default.pfp, 'pfp.png');

      _data.pfp = {
        update: {
          curr: pfpPath,
          is_default: true,
        },
      };
    }
    // 이미 default라면 건들필요 없다.
  }
  // default로 변경하려는 것이 아니고, 다른 image로 변경하려고한다면
  else if (data.pfp) {
    await data.pfp.mv(path.join(uploadPath.user.pfp, `${userId}.png`));

    const pfpPath = path.join(to.pfp, `${userId}.png`);

    _data.pfp = { update: { curr: pfpPath, is_default: false } };
  }

  const updatedUser = await prismaClient.user.update({
    where: {
      id: userId,
    },
    data: _data,
    include: {
      pfp: true,
    },
  });

  return updatedUser;
}
