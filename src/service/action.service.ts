import prismaClient from '../database';
import { ActionCreateInput } from '../../@types/action';
import { servingURL } from '../config/path.config';
import mime from 'mime';

export const createAction = async (data: ActionCreateInput) => {
  const fullImageName =
    data.capture_file.filename +
    '.' +
    mime.extension(data.capture_file.mimetype);

  const captureServingURL = new URL(fullImageName, servingURL.action.capture);

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
