import { describe, it, expect } from "vitest";

import * as codecs from "../src";
import * as t from "ts-codec";

const generate = (codec: t.AnyCodec) => {
  const encoded = t.generateJSONSchema(codec, {
    parsers: codecs.parsers,
    target: t.TransformTarget.Encoded,
  });
  const decoded = t.generateJSONSchema(codec, {
    parsers: codecs.parsers,
    target: t.TransformTarget.Decoded,
  });

  return { encoded, decoded };
};

describe("parsers", () => {
  it("should correctly generate date schemas", () => {
    expect(generate(codecs.date)).toMatchSnapshot();
  });

  it("should correctly generate buffer schemas", () => {
    expect(generate(codecs.buffer)).toMatchSnapshot();
  });

  it("should correctly generate ObjectId schemas", () => {
    expect(generate(codecs.ObjectId)).toMatchSnapshot();
  });

  it("should correctly generate ResourceId schemas", () => {
    expect(generate(codecs.ResourceId)).toMatchSnapshot();
  });

  it("should correctly generate Filterable schema from Object", () => {
    const filterObject1 = t.object({
      test1: t.string,
    });

    const filterObject2 = t.object({
      test2: t.number,
    });

    const filterObject3 = t.object({
      test1: t.string,
    });

    const filterObject4 = filterObject1.and(filterObject2).and(filterObject3);

    const filterableObject = codecs.FilterProperties(filterObject4);
    expect(generate(filterableObject)).toMatchSnapshot();
  });
});
