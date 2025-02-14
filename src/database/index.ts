import { withDatabase } from "@db/mongodb";
import { UserSchema, UserSchemaImpl } from "@db/schema/UserSchema";

import { ClassType, CollectionEx } from "@type/Helper";

export * from "./mongodb";

interface Coffee {
  _id: number;
  name: string;
}

class CoffeeImpl implements Coffee {
  _id!: number;
  name!: string;

  constructor(raw: Coffee) {
    this._id = raw._id;
    this.name = raw.name;
  }
}

type SchemaType = {
  User: UserSchema;
  Coffee: Coffee;
};

const SchemaMap: {
  [Key in keyof SchemaType]: ClassType<SchemaType[Key]>;
} = {
  User: UserSchemaImpl,
  Coffee: CoffeeImpl,
};

export async function withCollection<Schema extends keyof SchemaType, R extends SchemaType[Schema]>(
  schema: Schema,
  block: (collection: CollectionEx<R>) => Promise<R | null>,
): Promise<R | null> {
  return withDatabase(async (db) => {
    const collection = db.collection<R>(schema) as CollectionEx<R>;
    return block(collection)
      .then((raw) => {
        if (raw) {
          const clazz = SchemaMap[schema];
          // @ts-ignore
          return new clazz(raw);
        }
        return null;
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  });
}

export async function withCollectionAggregate<Schema extends keyof SchemaType, R>(
  schema: Schema,
  mapper: ClassType<R>,
  block: (collection: CollectionEx<SchemaType[Schema]>) => Promise<R | null>,
): Promise<R | null> {
  return withDatabase(async (db) => {
    const collection = db.collection<SchemaType[Schema]>(schema) as CollectionEx<SchemaType[Schema]>;
    return block(collection)
      .then((raw) => {
        if (raw) {
          // @ts-ignore
          return new mapper(raw);
        }
        return null;
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  });
}

type Aggregate = {
  _id: number;
};

class AggregateClazz implements Aggregate {
  _id!: number;
  constructor(raw: UserSchema) {
    this._id = raw._id;
  }
}

export function queryUser() {
  withCollectionAggregate<"Coffee", Aggregate>("Coffee", AggregateClazz, (c) => {
    return Promise.resolve({
      _id: 1,
    });
  });
  return withCollection("User", (collection) => {
    return collection.findOne({ _id: 1 });
  });
}
