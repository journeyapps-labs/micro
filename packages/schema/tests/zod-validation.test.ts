import { describe, test, expect } from "vitest";

import * as micro_schema from "../src";
import * as t from "zod";

describe("zod-validation", () => {
  const schema = t.object({
    name: t.string(),
    surname: t.string(),
    other: t.object({
      a: t.array(t.string()),
      b: t.literal("optional").optional(),
    }),
  });

  test("passes validation for runtime codec", () => {
    const validator = micro_schema.createZodValidator(schema);

    const result = validator.validate({
      name: "a",
      surname: "b",
      other: {
        a: ["nice"],
        b: "optional",
      },
    });

    expect(result).toMatchSnapshot();
  });

  test("fails validation for runtime codec", () => {
    const validator = micro_schema.createZodValidator(schema);

    const result = validator.validate({
      // @ts-ignore
      name: 1,
      other: {
        // @ts-ignore
        b: "op",
      },
    });

    expect(result).toMatchSnapshot();
  });
});
