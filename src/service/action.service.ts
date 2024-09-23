import prismaClient from '../database';
import { ActionCreateInput, ActionGetInput } from '../../@types/action';
import { servingURL } from '../config/path.config';
import { wwsError } from '../error/wwsError';

export const createAction = async (data: ActionCreateInput) => {
  const captureServingURL = new URL(
    data.capture_file.filename,
    servingURL.action.capture
  );

  const action = await prismaClient.action.create({
    data: {
      user_id: data.user_id,
      location_x: data.location_x,
      location_y: data.location_y,
      label: data.label,
      score: data.score,
      capture: captureServingURL.toString(),
    },
  });

  return action;
};

export const getAction = async (data: ActionGetInput) => {
  const action = await prismaClient.action.findFirst({
    where: {
      id: data.action_id,
      user_id: data.user_id,
    },
  });

  if (!action) {
    throw new wwsError(404, 'action not found');
  }

  return action;
};
