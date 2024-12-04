export interface BotConfig {
  id: string;
  appId: string;
  token: string;
  secret: string;
  debugMode: boolean;
}

export type AronaConfig = {
  bot: BotConfig;
  web: {
    port: number;
  };
};
