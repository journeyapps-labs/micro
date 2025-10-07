import { describe, test, expect } from 'vitest';

import * as micro_streaming from '../src';
import * as stream from 'stream/web';
import * as bson from 'bson';

describe('bson-transformer', () => {
  test('it successfully reads data from chunks array', () => {
    const chunks = Array.from(Array(10).keys()).map((_, i) => Buffer.alloc(i));

    expect(micro_streaming.bson.readBufferFromChunks(chunks, 50)).toBe(null);
    expect(micro_streaming.bson.readBufferFromChunks(chunks, 5)?.chunks_read).toBe(4);
    expect(micro_streaming.bson.readBufferFromChunks(chunks, 2)?.buffer.length).toBe(3);
  });

  test('it successfully reads data from chunks array, modifying original', () => {
    const chunks = Array.from(Array(10).keys()).map((_, i) => Buffer.alloc(i));

    const read1 = micro_streaming.bson.readBufferFromChunksAndModify(chunks, 1);
    expect(read1?.length).toBe(1);
    expect(chunks.length).toBe(8);

    const read2 = micro_streaming.bson.readBufferFromChunksAndModify(chunks, 1);
    expect(read2?.length).toBe(1);
    expect(chunks.length).toBe(8);
    expect(chunks[0].length).toBe(1);
  });

  test('it successfully deserializes streamed bson data', async () => {
    const source = new stream.ReadableStream({
      start(controller) {
        controller.enqueue(bson.serialize({ a: 'b' }));
        controller.enqueue(bson.serialize({ c: 'd' }));
        controller.enqueue(bson.serialize({ e: 'f' }));
        controller.enqueue(micro_streaming.bson.TERMINATOR);
        controller.close();
      }
    });

    const sink = source.pipeThrough(micro_streaming.bson.createBSONStreamDecoder());
    expect(await micro_streaming.drain(sink)).toMatchSnapshot();
  });

  test('it successfully serializes objects to bson stream', async () => {
    const source = new stream.ReadableStream({
      start(controller) {
        controller.enqueue({ a: 'b' });
        controller.enqueue({ c: 'd' });
        controller.enqueue({ e: 'f' });
        controller.close();
      }
    });

    const sink = source.pipeThrough(micro_streaming.bson.createBSONStreamEncoder());
    expect(Buffer.concat(await micro_streaming.drain(sink))).toMatchSnapshot();
  });

  test('end-to-end streaming', async () => {
    const output = micro_streaming
      .readableFrom([{ a: 'b' }, { c: 'd' }, { e: 'f' }])
      .pipeThrough(micro_streaming.bson.createBSONStreamEncoder())
      .pipeThrough(micro_streaming.bson.createBSONStreamDecoder());

    expect(await micro_streaming.drain(output)).toMatchSnapshot();
  });
});
