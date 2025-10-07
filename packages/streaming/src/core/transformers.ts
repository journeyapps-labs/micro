/**
 * A set of standard helpers for working with iterators.
 *
 * The majority of the utils included here can be removed if and when the tc39 iterator-helpers proposal lands:
 * https://github.com/tc39/proposal-iterator-helpers
 */

import { StreamLike } from "./utils";

export type ExtractStreamElementType<T extends StreamLike<any>> =
  T extends Iterable<infer I>
    ? I
    : T extends AsyncIterable<infer I>
      ? I
      : never;

/**
 * Takes n number of streams (or any AsyncIterators) and returns an AsyncGenerator that
 * yields the concatenated output of all input streams
 */
export async function* concat<S extends StreamLike<any>>(
  ...sources: S[]
): AsyncGenerator<ExtractStreamElementType<S>> {
  for (const source of sources) {
    yield* source as unknown as AsyncGenerator<ExtractStreamElementType<S>>;
  }
}

/**
 * Implements `Array.prototype.map` for iterables
 */
export async function* map<I, O>(
  iterable: StreamLike<I>,
  transform: (element: I) => O | Promise<O>,
) {
  for await (const element of iterable) {
    yield await transform(element);
  }
}

/**
 * Implements `Array.prototype.filter` for iterables
 */
export async function* filter<I>(
  iterable: StreamLike<I>,
  comparator: (element: I) => boolean | Promise<boolean>,
) {
  for await (const element of iterable) {
    if (await comparator(element)) {
      yield element;
    }
  }
}

type ReducedValue<T> = {
  __reduced: true;
  value: T;
};
export const reduced = <T>(value: T) => {
  return {
    __reduced: true,
    value,
  };
};

const isReducedValue = <T>(
  value: any | ReducedValue<T>,
): value is ReducedValue<T> => {
  return "__reduced" in value && value.__reduced;
};

/**
 * Implements `Array.prototype.reduce` for iterables.
 *
 * The reducer can return `reduced(accumulator)` to end execution early
 */
export const reduce = async <I, A>(
  iterable: StreamLike<I>,
  reducer: (
    accumulator: A,
    element: I,
  ) => A | ReducedValue<A> | Promise<A | ReducedValue<A>>,
  init: A,
) => {
  let accumulator = init;
  for await (const element of iterable) {
    const result = await reducer(accumulator, element);
    if (isReducedValue(result)) {
      return result.value;
    }
    accumulator = result;
  }
  return accumulator;
};

/**
 * Drain a given iterables contents into an array. This is kind of like `Array.from` except it works
 * with AsyncIterables
 */
export const drain = async <T>(iterator: StreamLike<T>) => {
  const data: T[] = [];
  for await (const chunk of iterator) {
    data.push(chunk);
  }
  return data;
};
