export interface ActionCreateInput {
  user_id: number;
  location_x: number;
  location_y: number;
  score: number;
  label: string;
  capture_file: Express.Multer.File;
}
