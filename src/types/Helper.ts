import { Collection, Document, InsertOneOptions, InsertOneResult, OptionalUnlessRequiredId } from "mongodb";
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
export type ClassType<T = any> = Function & { prototype: T };

type OmitKeyType<T, KeyType> = {
  [K in keyof T as T[K] extends KeyType ? never : K]: T[K];
};

type OmitNullish<T> = OmitKeyType<T, undefined | null>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExcludeFn<T> = OmitKeyType<T, (...args: any) => any>;

export type CollectionEx<TSchema extends Document = Document> = Collection<TSchema> & {
  insertOne(
    doc: OptionalUnlessRequiredId<ExcludeFn<TSchema>>,
    options?: InsertOneOptions,
  ): Promise<InsertOneResult<TSchema>>;
};
