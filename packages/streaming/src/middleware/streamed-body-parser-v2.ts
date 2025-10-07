declare module "express" {
  interface Request {
    stream?: AsyncIterable<Buffer>;
  }
}

import * as stream_headers from "../bson/header";
import * as express from "express";

/**
 * Parse an incoming request by decoding the body as a bson stream. This will read the first
 * incoming document as the request payload and then passthrough the remaining body as a
 * property called `stream` on the request
 */
export const streamedRequestBodyParserV2 = async (
  req: express.Request,
  _: express.Response,
  next: express.NextFunction,
) => {
  try {
    if (!req.is("application/*+header")) {
      return next();
    }

    const { header, stream } =
      await stream_headers.extractHeaderFromStream(req);

    req.stream = stream;
    req.body = header;
    next();
  } catch (err) {
    next(err);
  }
};
