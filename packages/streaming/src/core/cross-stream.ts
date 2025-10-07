import type * as stream from 'stream/web';

let Readable: typeof stream.ReadableStream;
let Transform: typeof stream.TransformStream;
let ByteLengthStrategy: typeof stream.ByteLengthQueuingStrategy;

if (typeof window !== 'undefined') {
  Readable = ReadableStream as any;
  Transform = TransformStream as any;
  ByteLengthStrategy = ByteLengthQueuingStrategy as typeof stream.ByteLengthQueuingStrategy;
} else {
  const webstream = require('stream/web');
  Readable = webstream.ReadableStream;
  Transform = webstream.TransformStream;
  ByteLengthStrategy = webstream.ByteLengthQueuingStrategy;
}

export { Readable, Transform, ByteLengthStrategy };
