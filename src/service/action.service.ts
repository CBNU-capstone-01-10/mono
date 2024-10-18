import prismaClient from '../database';
import {
  ActionCreateInput,
  ActionGetInput,
  ActionsGetInput,
} from '../../@types/action';
import { to, uploadPath } from '../config/path.config';
import { wwsError } from '../error/wwsError';
import moment from 'moment';
import path from 'path';

export const createAction = async (data: ActionCreateInput) => {
  const captureFileName = data.user_id + '-' + Date.now().toString() + '.png';

  data.capture_file.mv(path.join(uploadPath.action.capture, captureFileName));

  const action = await prismaClient.action.create({
    data: {
      user_id: data.user_id,
      location_x: data.location_x,
      location_y: data.location_y,
      label: data.label,
      score: data.score,
      capture: path.join(to.action.capture, captureFileName),
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

// filter는 2가지가 가능하며, 중복될 순 없다.
// - start, end가 모두 명시된 경우 : start date ~ end date의 모든 action을 가져온다.
// - before_m 만이 명시된 경우 : 현재 시간으로 before_m 분전의 모든 action을 가져온다.
export const getActions = async (data: ActionsGetInput) => {
  let actions;

  if (data.before_m && !data.date_start && !data.date_end) {
    const curr = moment();
    const end = moment().subtract(data.before_m, 'minute');

    actions = await prismaClient.action.findMany({
      where: {
        user_id: data.user_id,
        recorded_at: {
          lte: curr.toDate(),
          gte: end.toDate(),
        },
      },
    });
  } else if (!data.before_m && data.date_start && data.date_end) {
    const date_start = moment(data.date_start);
    const date_end = moment(data.date_end);

    if (date_start > date_end) {
      throw new wwsError(400, 'date_start can not greater than date_end');
    }

    actions = await prismaClient.action.findMany({
      where: {
        recorded_at: {
          lte: date_end.toDate(),
          gte: date_start.toDate(),
        },
      },
    });
  }
  // 둘이 모두 명시되어있지 않다면, 잘못된 요청이다.
  else {
    throw new wwsError(400, 'bad query parameter combination');
  }

  return actions;
};
