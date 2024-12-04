import { TencentBotEvent } from "./Event";
import { Bot } from "../Bot";

export class TencentBotAuthorizationSuccessEvent extends TencentBotEvent {
  constructor(readonly bot: Bot) {
    super(bot);
  }
  toString(): string {
    return `TencentBotAuthorizationSuccessEvent(bot=${this.bot.id})`;
  }
}

export class TencentBotOnlineEvent extends TencentBotEvent {
  constructor(readonly bot: Bot) {
    super(bot);
  }

  toString(): string {
    return `TencentBotOnlineEvent(bot=${this.bot.id})`;
  }
}
