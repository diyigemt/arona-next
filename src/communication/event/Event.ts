// @ts-ignore
import { Bot } from "../Bot";
import { MessageChain } from "../message/MessageChain";

export class Event {
  broadcast<T extends Event>(): T {
    // @ts-ignore
    GlobalEventChannel.broadcastEvent(this);
    return this as unknown as T;
  }
}

export abstract class BaseEvent extends Event {}

export class TencentEvent extends BaseEvent {}

export class TencentBotEvent extends TencentEvent {
  constructor(readonly bot: Bot) {
    super();
  }
}

export abstract class TencentMessageEvent extends TencentBotEvent {
  abstract subject: string;
  abstract sender: string;

  constructor(
    readonly bot: Bot,
    readonly message: MessageChain,
  ) {
    super(bot);
  }
}
