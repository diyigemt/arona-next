export interface BotConfig {
  id: string;
  appId: string;
  token: string;
  secret: string;
  debugMode: boolean;
}

export interface MongodbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  db: string;
}

export type AronaConfig = {
  bot: BotConfig;
  mongodb: MongodbConfig;
  web: {
    port: number;
  };
};
