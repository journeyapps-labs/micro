import * as stream from "../core/cross-stream";
import * as constants from "./constants";
import * as bson from "bson";

export type BSONStreamEncoderParams<T> = {
  serialize_options?: bson.SerializeOptions;
  sendTerminatorOnEnd?: boolean;
  writableStrategy?: QueuingStrategy<T | undefined>;
  readableStrategy?: QueuingStrategy<Buffer | undefined>;
};

export const createBSONStreamEncoder = <T extends {} = any>(
  params?: BSONStreamEncoderParams<T>,
) => {
  let readableStrategy = params?.readableStrategy;
  if (!readableStrategy) {
    readableStrategy = new stream.ByteLengthStrategy({
      highWaterMark: 1024 * 16,
    });
  }

  return new stream.Transform<T, Buffer>(
    {
      transform(chunk, controller) {
        controller.enqueue(
          Buffer.from(bson.serialize(chunk, params?.serialize_options)),
        );
      },
      flush(controller) {
        if (params?.sendTerminatorOnEnd ?? true) {
          controller.enqueue(constants.TERMINATOR);
        }
      },
    },
    params?.writableStrategy,
    readableStrategy,
  );
};
