import { ObjectSchema, Schema } from 'joi';

export interface ValidationSchema {
  params?: ObjectSchema<any>;
  query?: ObjectSchema<any>;
  body?: ObjectSchema<any>;
  file?: Schema;
  files?: Schema;
}
