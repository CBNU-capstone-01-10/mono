import joi from 'joi';

class JoiBaseSchema<T extends joi.AnySchema> {
  protected schema: T;

  constructor(schema: T) {
    this.schema = schema;
  }
}

class JoiStringBaseSchema extends JoiBaseSchema<joi.StringSchema> {
  private specialCharacters = /[[\]!"#$%&'()*+,./:;<=>?@^_`{|}~-]/;

  constructor() {
    super(joi.string());
  }

  public withoutSpecialChar(): joi.StringSchema {
    const stringSchema = this.schema.regex(this.specialCharacters, {
      invert: true,
    });

    return stringSchema;
  }
}

export const stringBase = new JoiStringBaseSchema();
