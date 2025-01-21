import { Bot } from "./Bot";

class BotManager {
  constructor(private readonly bots: Bot[] = []) {}

  registerBot(bot: Bot) {
    this.bots.push(bot);
  }

  getBot(botId?: string): Bot | undefined {
    if (botId) {
      return this.bots.find((bot) => bot.id === botId);
    }
    return this.bots[0];
  }
}

export default new BotManager();
