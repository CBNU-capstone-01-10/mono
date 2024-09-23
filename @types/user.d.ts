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
