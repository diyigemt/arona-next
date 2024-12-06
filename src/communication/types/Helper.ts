export type Nullable<T> = T | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
export type ClassType<T = any> = Function & { prototype: T };
