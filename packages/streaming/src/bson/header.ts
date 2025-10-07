import * as buffer_array from './buffer-array';
import * as bson from 'bson';

export type DecodedResponse<T> = {
  header: T;
  stream: AsyncIterable<Buffer>;
};

export type ExtractHeaderParams = {
  deserialize_options?: bson.DeserializeOptions;
};
export const extractHeaderFromStream = async <T = any>(
  input_stream: AsyncIterable<Buffer>,
  params?: ExtractHeaderParams
): Promise<DecodedResponse<T>> => {
  const iterator = input_stream[Symbol.asyncIterator]();

  const buffer = buffer_array.createReadableBufferArray();
  let frame_size: number | null = null;

  async function* resplice(data: Buffer | null, iterator: AsyncIterator<Buffer>) {
    if (data) {
      yield data;
    }

    while (true) {
      const next = await iterator.next();
      if (next.done) {
        return;
      }

      yield next.value;
    }
  }

  while (true) {
    const chunk = await iterator.next();
    if (chunk.done) {
      throw new Error('Stream did not complete successfully');
    }

    buffer.push(chunk.value);

    if (frame_size === null) {
      frame_size = buffer.peek(4)?.readInt32LE(0) || null;
    }
    if (frame_size === null) {
      continue;
    }

    const frame = buffer.read(frame_size);
    if (!frame) {
      continue;
    }

    const header = bson.deserialize(frame, {
      promoteBuffers: true,
      ...(params?.deserialize_options || {})
    });

    return {
      header: header as T,
      stream: resplice(buffer.read(buffer.size()), iterator)
    };
  }
};

export async function* prependHeaderToStream<T>(
  header: any,
  input_stream: Iterable<T> | AsyncIterable<T>
): AsyncGenerator<T | Uint8Array> {
  yield bson.serialize(header);
  yield* input_stream;
}
