import * as stream from "stream";

export type SimpleReadableLike = stream.Readable | stream.Transform;

/**
 * This provides an abstraction for pushing data onto a Readable stream, returning a Promise that
 * resolves once any present backpressure is drained.
 *
 * This is special as it can handle Transform streams in addition to normal Readables. Transform
 * streams don't natively expose a method for hooking into the readable sides drain and causes
 * problems when building inflating transforms.
 *
 * The comment at the top of the official node implementation provides more detailed information
 * on the problem: https://github.com/nodejs/node/blob/master/lib/internal/streams/transform.js
 */
export const push = async (readable: SimpleReadableLike, data: any) => {
  const can_continue = readable.push(data);
  if (can_continue) {
    return;
  }

  // We can't really support transform streams
  if (readable instanceof stream.Transform) {
    return;
  }

  return new Promise<void>((resolve) => {
    const errorHandler = () => {
      resolve();
    };

    readable.once("error", errorHandler);
    readable.once("drain", () => {
      readable.removeListener("error", errorHandler);
      resolve();
    });
  });
};
