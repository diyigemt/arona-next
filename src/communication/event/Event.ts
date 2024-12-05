import { Bot } from "../Bot";
import { MessageChain } from "../message/MessageChain";
import { BaseEventChannel } from "./EventChannel";
import { GuildChannelType } from "../types/Message";

export class Event {
  async broadcast<T extends Event>() {
    await GlobalEventChannel.broadcastEvent(this);
    return this as unknown as T;
  }
}

export abstract class BaseEvent extends Event {}

export abstract class AbstractEvent extends BaseEvent {
  abstract toString(): string;
}

export abstract class BotEvent extends AbstractEvent {
  constructor(readonly bot: Bot) {
    super();
  }
}

export abstract class MessageEvent extends BotEvent {
  abstract subject: string;
  abstract sender: string;

  constructor(
    readonly bot: Bot,
    readonly message: MessageChain,
  ) {
    super(bot);
  }
}

export abstract class GuildEvent extends BotEvent {
}

const GlobalEventChannel = new BaseEventChannel();

export default GlobalEventChannel;
