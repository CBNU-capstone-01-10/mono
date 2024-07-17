import { Request, Response } from 'express';
import asyncCatch from '../utils/asyncCatch';
import { userService } from '../service';

// POST /login
export const login = asyncCatch(async (req: Request, res: Response) => {
  const user = await userService.loginUser(req.body);

  req.session.userId = user.id;

  return res.status(200).end();
});

// POST /register
export const register = asyncCatch(async (req: Request, res: Response) => {
  const createdUser = await userService.createUser(req.body);

  return res.status(201).json(createdUser);
});

// GET /register/verify
export const verify = asyncCatch(async (req: Request, res: Response) => {
  const { user_id, token } = req.query;

  await userService.verifyUser(parseInt(user_id as string), token as string);

  return res.status(200).end();
});
