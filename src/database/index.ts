import { withDatabase } from "@db/mongodb";
import { UserSchema, UserSchemaImpl } from "@db/schema/UserSchema";

import { ClassType, CollectionEx } from "@type/Helper";

export * from "./mongodb";

type SchemaType = {
  User: UserSchema;
};

const SchemaMap: {
  [Key in keyof SchemaType]: ClassType<SchemaType[Key]>;
} = {
  User: UserSchemaImpl,
};

export async function withCollection<Schema extends keyof SchemaType, R>(
  schema: Schema,
  block: (collection: CollectionEx<SchemaType[Schema]>) => Promise<R>,
): Promise<R> {
  return withDatabase((db) => {
    const collection = db.collection<SchemaType[Schema]>(schema) as CollectionEx<SchemaType[Schema]>;
    return block(collection);
  });
}

export function queryUser() {
  return withCollection("User", (collection) => {
    return collection.findOne({ _id: 1 });
  });
}
