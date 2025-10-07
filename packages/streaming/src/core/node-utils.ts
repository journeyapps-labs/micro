import * as stream from "stream";

/**
 * Returns a promise that resolves once the given stream finishes. If the stream emits an error then
 * then promise will reject
 */
export const wait = (stream: stream.Stream) => {
  return new Promise((resolve, reject) => {
    stream.on("error", reject);
    stream.on("end", resolve);
    stream.on("finish", resolve);
  });
};
