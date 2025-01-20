import { isFunction } from "./TypeUtil";

export class TimeoutCancellationException extends Error {
  constructor(message: string = "Timeout cancellation failed") {
    super(message);
  }
}
export const Timout = Symbol.for("Timout");
export function withTimeout<T>(timeoutMillis: number, block: () => Promise<T>): Promise<T>;
export function withTimeout<T>(timeoutMillis: number, block: Promise<T>): Promise<T>;
export function withTimeout<T>(timeoutMillis: number, block: (() => Promise<T>) | Promise<T>): Promise<T> {
  const promise = isFunction(block) ? block() : block;
  const timout = new Promise((resolve) => setTimeout(resolve, timeoutMillis, Timout));
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
