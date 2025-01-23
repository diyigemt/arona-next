import { MongoClient, Db } from "mongodb";
import { MongodbConfig } from "@/types";

let databaseConnection: Db;

export async function initDatabase(config: MongodbConfig) {
  // "mongodb://$user:$password@$host:$port"
  const mongoClient = await MongoClient.connect(`mongodb://${config.user}:${config.password}@${config.host}:${config.port}`);
  databaseConnection = mongoClient.db(config.db);
}

export async function withDatabase<T>(block: (db: Db) => Promise<T>): Promise<T> {
  return block(databaseConnection);
}
