import { UploadedFile } from 'express-fileupload';
import { Prisma } from '@prisma/client';

export interface PublicUserInfo {
  id: number;
  username: string;
  pfp: string;
  email: string;
}

export interface UserGetInput {
  user_id: number;
  isSelf: boolean;
}

// user data 중 update 가능한 정보는 username
export interface UserUpdateInput
  extends Pick<Prisma.userUpdateInput, 'username'> {
  user_id: number;
  pfp?: UploadedFile;
  pfpToDefault?: boolean;
}
