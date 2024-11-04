import prismaClient from '../database';
import {
  ActionCreateInput,
  ActionGetInput,
  ActionsGetInput,
  ScoreSumGet,
} from '../../@types/action';
import { to, uploadPath } from '../config/path.config';
import { wwsError } from '../error/wwsError';
import moment from 'moment';
import path from 'path';

export const createAction = async (data: ActionCreateInput) => {
  const formData = new FormData();
  formData.append('image', new Blob([data.capture_file.data]));

  const detectionResponse = await fetch(
    `${process.env.DETECTIOR_SERVER}/detect`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (detectionResponse.status === 200) {
    const detectionResult = await detectionResponse.json();

    const captureFileName = data.user_id + '-' + Date.now().toString() + '.png';

    const { label, safe_driving, detail } = detectionResult;
    const _label = label.length ? label[0] : null;
    let action;

    // 가장 최근 action을 가져온다.
    const latestAction = await prismaClient.action.findFirst({
      where: {
        user_id: data.user_id,
      },
      orderBy: {
        recorded_at: 'desc',
      },
    });

    const minute = 1;
    const ago = new Date(Date.now() - minute * 60 * 1000); // 현재 시간에서 1분 전 시간 계산

    // 최근 action이 존재히며, 그게 1분전이라면 latestAction으로 판정
    if (latestAction && latestAction.recorded_at >= ago) {
      let score;
      // 현재 안전운전 vs 최근 위험운전 => 그냥 레코드 생성
      // 현재 안전운전 vs 최근 안전운전 => 최근 안전운전 업데이트
      // 현재 위험운전 vs 최근 안전운전 => 그냥 레코드 생성
      // 현재 위험운전 vs 최근 위험운전 => 라벨이 같으면 최근 위험운전 업데이트, 라벨이 다르면 레코드 생성
      // 즉, safe_driving이 같은 경우만 고려해주면 된다.
      if (safe_driving == latestAction.safe_driving) {
        // 둘 다 안전운전이라면
        if (safe_driving) {
          // 최근 action에 score에 1을 증가시켜 update한다.
          score = 1;
        }
        // 둘 다 위험운전이라면
        else {
          // 같은 라벨이라면
          if (label == latestAction.label) {
            score = -10;
          }
          // 다른 label이라면, record를 생성해야한다.
          else {
            action = await prismaClient.action.create({
              data: {
                user_id: data.user_id,
                location_x: data.location_x,
                location_y: data.location_y,
                label: _label,
                score: safe_driving ? 1 : -10,
                safe_driving,
                capture: path.join(to.action.capture, captureFileName),
              },
            });

            return action;
          }
        }

        action = await prismaClient.action.update({
          where: {
            id: latestAction.id,
          },
          data: {
            score: {
              increment: score,
            },
            recorded_at: new Date(),
          },
        });

        return action;
      }
      // 최근 action은 존재하지만, 둘의 safe_driving이 다른경우 새로운 record를 생성한다.
      // 위험운전 vs 안전운전
      // 안전운전 vs 위험운전
      // 인경우가 여기 포함된다.
      else {
        action = await prismaClient.action.create({
          data: {
            user_id: data.user_id,
            location_x: data.location_x,
            location_y: data.location_y,
            label: _label,
            score: safe_driving ? 1 : -10,
            safe_driving,
            capture: path.join(to.action.capture, captureFileName),
          },
        });
      }
      return action;
    }
    // 최근 action이 없다면 그냥 생성하면 된다.
    else {
      const action = await prismaClient.action.create({
        data: {
          user_id: data.user_id,
          location_x: data.location_x,
          location_y: data.location_y,
          label: _label,
          score: safe_driving ? 1 : -10,
          safe_driving,
          capture: path.join(to.action.capture, captureFileName),
        },
      });

      return action;
    }
  }
  // detector server응답이 200이 아니라면
  else {
    throw new wwsError(500, 'internal server error');
  }
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
      skip: (data.page - 1) * data.per_page,
      take: data.per_page,
      where: {
        user_id: data.user_id,
        recorded_at: {
          lte: curr.toDate(),
          gte: end.toDate(),
        },
      },

      orderBy: [{ recorded_at: 'desc' }],
    });
  } else if (!data.before_m && data.date_start && data.date_end) {
    const date_start = moment(data.date_start);
    const date_end = moment(data.date_end);

    if (date_start > date_end) {
      throw new wwsError(400, 'date_start can not greater than date_end');
    }

    actions = await prismaClient.action.findMany({
      skip: (data.page - 1) * data.per_page,
      take: data.per_page,
      where: {
        recorded_at: {
          lte: date_end.toDate(),
          gte: date_start.toDate(),
        },
      },
      orderBy: [{ recorded_at: 'desc' }],
    });
  }
  // 둘이 모두 명시되어있지 않다면, 잘못된 요청이다.
  else {
    throw new wwsError(400, 'bad query parameter combination');
  }

  return actions;
};

export const getScoreSum = async (data: ScoreSumGet) => {
  const scoreSum = await prismaClient.action.aggregate({
    where: {
      user_id: data.user_id,
      recorded_at: {
        gte: data.date_start,
        lte: data.date_end,
      },
    },
    _sum: { score: true },
  });

  return scoreSum;
};
