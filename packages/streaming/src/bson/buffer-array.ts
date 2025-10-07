/**
 * Read a given `size` number of bytes from a give array of `chunks` as a Buffer. The returned Buffer could be
 * larger than the requested size. If the chunks array contains less than the requested size then null is
 * returned
 */
export const readBufferFromChunks = (chunks: Buffer[], size: number) => {
  let batch = [];
  let current_size = 0;
  for (const chunk of chunks) {
    batch.push(chunk);
    current_size += chunk.length;
    if (current_size >= size) {
      return {
        buffer: Buffer.concat(batch),
        chunks_read: batch.length
      };
    }
  }
  return null;
};

/**
 * Read exactly `size` bytes from a given array of `chunks`, modifying the passed array to remove what
 * was read.
 *
 * If more than `size` is read from the chunks array then the remainder is unshifted back onto the array
 */
export const readBufferFromChunksAndModify = (chunks: Buffer[], size: number): Buffer | null => {
  const res = readBufferFromChunks(chunks, size);
  if (!res) {
    return null;
  }

  if (res.buffer.length > size) {
    chunks.splice(0, res.chunks_read, res.buffer.slice(size));
    return res.buffer.slice(0, size);
  }
  chunks.splice(0, res.chunks_read);
  return res.buffer;
};

/**
 * Creates a abstraction on top of a compressed set of Buffer chunks that keeps track of the
 * entire byte size of the chunks array.
 *
 * Offers methods to get the byte size, peak at a given amount of data and destructively read
 * a given amount of data
 */
export const createReadableBufferArray = () => {
  let chunks: Buffer[] = [];
  let current_size = 0;
  return {
    push(...new_chunks: Array<Uint8Array | Buffer>) {
      const normalized_chunks = new_chunks.map((chunk) => (Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      chunks.push(...normalized_chunks);
      current_size = new_chunks.reduce((size, chunk) => {
        return size + chunk.length;
      }, current_size);
    },
    read(size: number) {
      const buffer = readBufferFromChunksAndModify(chunks, size);
      if (buffer) {
        current_size -= size;
      }

      return buffer;
    },
    peek(size: number) {
      if (current_size < size) {
        return null;
      }

      const res = readBufferFromChunks(chunks, 4);
      if (!res) {
        return null;
      }

      return res.buffer;
    },
    size() {
      return current_size;
    }
  };
};

export type ReadableBufferArray = ReturnType<typeof createReadableBufferArray>;
