import { describe, test, expect } from 'vitest';

import * as micro_streaming from '../src';
import * as crypto from 'crypto';
import * as _ from 'lodash';

describe('bson-stream-header', () => {
  test('it should successfully extract the header from a bson stream', async () => {
    const bson_stream = micro_streaming
      .readableFrom([{ a: 'b' }, { c: 'd' }])
      .pipeThrough(micro_streaming.bson.createBSONStreamEncoder());

    const { header, stream: remaining } = await micro_streaming.bson.extractHeaderFromStream(bson_stream);
    expect(header).toEqual({
      a: 'b'
    });

    const decoded_stream = micro_streaming
      .readableFrom(remaining)
      .pipeThrough(micro_streaming.bson.createBSONStreamDecoder());
    expect(await micro_streaming.drain(decoded_stream)).toEqual([
      {
        c: 'd'
      }
    ]);
  });

  test('it should handle a lot of data', async () => {
    function* generator() {
      for (const i of _.range(20)) {
        yield {
          data: crypto.randomBytes(1024 * 1024)
        };
      }
    }

    const bson_stream = micro_streaming
      .readableFrom(generator())
      .pipeThrough(micro_streaming.bson.createBSONStreamEncoder());

    const { header, stream: remaining } = await micro_streaming.bson.extractHeaderFromStream(bson_stream);
    expect(Buffer.isBuffer(header.data)).toBe(true);

    const decoded_stream = await micro_streaming.drain(
      micro_streaming.readableFrom(remaining).pipeThrough(micro_streaming.bson.createBSONStreamDecoder())
    );
    expect(decoded_stream.length).toBe(19);
  });

  test('it should properly prepend a header to a bson stream', async () => {
    const data = [{ a: 'b' }, { c: 'd' }];
    const bson_stream = micro_streaming.readableFrom(data).pipeThrough(micro_streaming.bson.createBSONStreamEncoder());

    const stream_with_header = micro_streaming.bson.prependHeaderToStream(
      {
        key: 'value'
      },
      bson_stream
    );

    const decoded = micro_streaming
      .readableFrom(stream_with_header)
      .pipeThrough(micro_streaming.bson.createBSONStreamDecoder());

    expect(await micro_streaming.drain(decoded)).toEqual([
      {
        key: 'value'
      },
      ...data
    ]);
  });
});
