import * as querystring from 'querystring';
import * as express from 'express';

/**
 * Parse an incoming request decoding a base64 encoded, JSON formatted `payload` query string
 * onto the request body. This is useful in streaming scenarios where the request body is a
 * stream that needs to be processed independently from the request 'params' or 'metadata'
 *
 * For example, the request
 *
 * POST /a/b?payload=ey...
 * <stream>
 *
 * would be decoded into a `body` field on the request without touching the stream
 *
 * @deprecated
 */
export const streamedRequestBodyParser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    let payload = req.query.payload;
    if (!payload) {
      return next();
    }
    if (typeof payload !== 'string') {
      return next();
    }
    req.body = JSON.parse(Buffer.from(payload, 'base64').toString());
    delete req.query.payload;

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Given some payload of data encode it for using as a journey streamed URL payload
 *
 * This means JSON stringified, base64 url-encoded
 *
 * @deprecated
 */
export const encodeStreamingPayload = (data: object) => {
  return querystring.escape(Buffer.from(JSON.stringify(data)).toString('base64'));
};

/**
 * Encode a given payload for streaming and append it as a query string to a given
 * URL
 *
 * @deprecated
 */
export const encodeURLPayload = (url: string, data: object) => {
  const payload = encodeStreamingPayload(data);
  return `${url}?payload=${payload}`;
};
