import * as defs from "../definitions";
import * as t from "zod";

export type ZodValidator<T extends t.ZodType<any>> = defs.MicroValidator<
  t.infer<T>
> & {
  schema: T;
};

/**
 * Create a validator from a given Zod schema
 * https://github.com/colinhacks/zod
 */
export const createZodValidator = <T extends t.ZodType<any>>(
  schema: T,
): ZodValidator<T> => {
  return {
    schema: schema,
    validate: (data) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        return {
          valid: false,
          errors: [JSON.stringify(result.error.format())],
        };
      }

      return {
        valid: true,
      };
    },
  };
};
