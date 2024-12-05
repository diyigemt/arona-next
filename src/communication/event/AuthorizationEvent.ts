import { BotEvent } from "./Event";
import { Bot } from "../Bot";

export class BotAuthorizationSuccessEvent extends BotEvent {
  constructor(readonly bot: Bot) {
    super(bot);
  }
  toString(): string {
    return `BotAuthorizationSuccessEvent(bot=${this.bot.id})`;
  }
}

export class BotOnlineEvent extends BotEvent {
  constructor(readonly bot: Bot) {
    super(bot);
  }

  toString(): string {
    return `BotOnlineEvent(bot=${this.bot.id})`;
  }
}
