import { isFunction } from "./TypeUtil";

export class TimeoutCancellationException extends Error {
  constructor(message: string = "Timeout cancellation failed") {
    super(message);
  }
}
export const Timout = Symbol.for("Timout");
export async function withTimeout<T>(timeoutMillis: number, block: () => Promise<T>): Promise<T>;
export async function withTimeout<T>(timeoutMillis: number, block: Promise<T>): Promise<T>;
export async function withTimeout<T>(timeoutMillis: number, block: (() => Promise<T>) | Promise<T>): Promise<T> {
  const promise = isFunction(block) ? await block() : block;
  const timout = new Promise<typeof Timout>((resolve) => setTimeout(resolve, timeoutMillis, Timout));
  return new Promise((resolve, reject) => {
    Promise.race([promise, timout]).then((res: T | typeof Timout) => {
      if (res === Timout) {
        reject(new TimeoutCancellationException());
      } else {
        resolve(res);
      }
    });
  });
}
export async function withTimeoutOrNull<T>(timeoutMillis: number, block: () => Promise<T>): Promise<T | undefined>;
export async function withTimeoutOrNull<T>(timeoutMillis: number, block: Promise<T>): Promise<T | undefined>;
export async function withTimeoutOrNull<T>(
  timeoutMillis: number,
  block: (() => Promise<T>) | Promise<T>,
): Promise<T | undefined> {
  const promise = isFunction(block) ? await block() : block;
  const timout = new Promise<typeof Timout>((resolve) => setTimeout(resolve, timeoutMillis, Timout));
  return new Promise((resolve) => {
    Promise.race([promise, timout]).then((res: T | typeof Timout) => {
      if (res === Timout) {
        resolve(undefined);
      } else {
        resolve(res);
      }
    });
  }) as Promise<T | undefined>;
}
