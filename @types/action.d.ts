import type { UploadedFile } from 'express-fileupload';

export interface ActionCreateInput {
  user_id: number;
  location_x: number;
  location_y: number;
  capture_file: UploadedFile;
}

export interface ActionGetInput {
  user_id: number;
  action_id: number;
}

export interface ActionsGetInput {
  user_id: number;
  date_start?: Date;
  date_end?: Date;
  before_m?: number;
  per_page: number;
  page: number;
}

export interface ScoreSumGet {
  user_id: number;
  date_start?: Date;
  date_end?: Date;
}
